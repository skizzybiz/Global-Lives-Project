#!/usr/bin/env ruby

require 'yaml'
require "open3"
require 'zlib'

scriptDir= File.expand_path(File.dirname(__FILE__))
$lintCommand= "#{scriptDir}/jsl -nologo +recurse -conf jsl.conf"
$compressCommand= "java -jar #{scriptDir}/yuicompressor-2.3.6.jar --type js"
$bootstrapFile= "#{scriptDir}/bootstrap-template.js"

$globalOptions= {
    "version"=>"",
    "packageType"=>"jsl",
    "packagePrefix"=>"",
    "outputFolder"=>"."
}

$PackageType= Struct.new(:includeFile, :fileFromPackage, :dependRegex)

$DojoPackage= $PackageType.new()
$DojoPackage.dependRegex= /dojo\.require\(["']([^"']*)["']\);?/
def $DojoPackage.includeFile(file)
    return "__package__.js"!=File.basename(file)
end
def $DojoPackage.fileFromPackage(package, sourceFile)
    package= package.gsub(/\*$/, '__package__')
    package= package.gsub(".", "/")
    package= File.expand_path(package + ".js")
    
    return package
end


$JslPackage= $PackageType.new()
$JslPackage.dependRegex= /\/\*jsl:import ([^\*]*)\*\//
def $JslPackage.includeFile(file)
    return true
end
def $JslPackage.fileFromPackage(package, sourceFile)
    return File.expand_path(File.join(File.dirname(sourceFile), package))
end



$packageType= nil


def relativePath(file, target)
    outputFolder= target["outputFolder"]
    len= outputFolder.length
    if (outputFolder==file[0,len])
        file= file[len..-1]
    end
    if ("/"==file[0,1])
        file= file[1..-1]
    end
    return file
end

def findDependencies(file, target)
    if (target["probedFiles"].include?(file))
        return
    end
    
    if (!target["includedFiles"].include?(file))
        return
    end
    
    target["probedFiles"].push(file)
 
    dirname= File.dirname(file)
    
    File.open(file).each { |line|
        if ($packageType!=$JslPackage)
            match= line.match($packageType.dependRegex)
            if (match)
                depend= $packageType.fileFromPackage(match[1], file)
                findDependencies(depend, target)
            end
        end
        
        match= line.match($JslPackage.dependRegex)
        
        if (!match)
            next
        end
        
        depend= $JslPackage.fileFromPackage(match[1], file)
        findDependencies(depend, target)
    }

    target['orderedFiles'].push(file)
end

def findAllFiles(include, exclude=[])
    files= []
    
    include.each { |i|
        i= File.expand_path(i)
        if (files.include?(i) || exclude.include?(i) ||
            !$packageType.includeFile(i))
            next
        end
    
        if File.directory?(i)
            Dir.chdir(i) do
                dirFiles= Dir.glob('**/*.js')
                dirFiles.map! { |f| File.expand_path(f) }
                dirFiles.map! { |f|
                    if (files.include?(f) || exclude.include?(f) ||
                        !$packageType.includeFile(f))
                        nil
                    else
                        f
                    end
                }
                dirFiles.compact!
                files.concat(dirFiles);
            end
        elsif File.exists?(i)
            files.push(i)
        end
    }

    files
end

def lintFiles(target)
    command= $lintCommand
    target["include"].each { |i|
        if (File.directory?(i))
            command+= " -process \"#{i}/*.js\""
        else
            command+= " -process \"#{i}\""
        end
    }
    stdin, stdout, stderr= Open3.popen3(command)
    stdin.close
    output= stdout.read
    errors= stderr.read
    
    puts output
end

def replaceTokens(string, params)
    return string.gsub(/(\n[\t ]*)?@([^@ \t\r\n]*)@/) { |m|
        key= $2
        ws= $1
        value= params[key]||"";
        if (ws && ws.length)
            ws + value.split("\n").join(ws);
        else
            value
        end
    }
end

def concatenateFiles(target)
    content= ""
    target["orderedFiles"].each { |file|
        content<< File.read(file)
        content<< "\n"
    }
    prefix= $globalOptions["packagePrefix"]

    if (!prefix)
        content.gsub!($packageType.dependRegex, '')
    else
        content.gsub!($packageType.dependRegex) { |text|
            if ($1[/^#{prefix}/])
                ''
            else
                text
            end
        }
    end
    
    # strip jsl imports
    if ($JslPackage!=$packageType)
        content.gsub!($JslPackage.dependRegex, '')
    end
    
    params= {
        "VERSION"=>target["version"],
        "REVISION"=>""
    }
    content= replaceTokens(content, params)
    
    target["concatenatedContent"]= content
    
    outputFile= File.new(target["concatenatedFile"],
                         File::CREAT|File::TRUNC|File::RDWR);
    outputFile.write(target["notice"])
    outputFile.write("\n")
    outputFile.write(content)
    outputFile.close
end

def compressFile(target)
    command= $compressCommand
    stdin, stdout, stderr= Open3.popen3(command)
    stdin.write(target["concatenatedContent"])
    stdin.close
    output= stdout.read
    errors= stderr.read

    puts errors
    
    outputFile= File.new(target["outputFile"],
                         File::CREAT|File::TRUNC|File::RDWR);
    target["compressedContent"]= output
    outputFile.write(target["notice"])
    outputFile.write("\n")
    outputFile.write(output)
    outputFile.close
    
    Zlib::GzipWriter.open(target["compressedFile"]) do |gz|
        gz.write output
    end
end

def writeDebugFile(target)
    bootstrap= File.read($bootstrapFile)
    bootstrapFiles= target["orderedFiles"].map { |file|
        "loadScript(\"#{relativePath(file, target)}\");"
    }
    
    params= {
        "BOOTSTRAP"=>target["name"],
        "BOOTSTRAP-FILES"=>bootstrapFiles.join("\n")
    }

    content= replaceTokens(bootstrap, params)
    
    outputFile= File.new(target["debugFile"],
                         File::CREAT|File::TRUNC|File::RDWR);
    outputFile.write(content)
    outputFile.close
end

def processTarget(target)
    puts "#{target['name']}:"
    
    target["outputFolder"]= File.expand_path(target["outputFolder"])
    
    target["outputFile"]= File.join(target["outputFolder"],
                                    "#{target['name']}.js");
    target["debugFile"]= File.join(target["outputFolder"],
                                   "#{target['name']}-debug.js");
    target["concatenatedFile"]= File.join(target["outputFolder"],
                                          "#{target['name']}-uncompressed.js");
    target["compressedFile"]= File.join(target["outputFolder"],
                                        "#{target['name']}.js.gz");

    if (target.key?("notice") && File.exists?(target["notice"]))
        target["notice"]= File.read(target["notice"])
    else
        target["notice"]=""
    end
     
    # remove target files
    [target["concatenatedFile"], target["debugFile"], target["outputFile"],
     target["compressedFile"]].each { |file|
        if (!File.exists?(file))
            next
        end
        File.delete(file)
    }
                           
    target["excludedFiles"]= findAllFiles(target["exclude"])
    target["includedFiles"]= findAllFiles(target["include"], target["excludedFiles"])
    
    target["includedFiles"].each { |file| findDependencies(file, target) }

    lintFiles(target)
    
    concatenateFiles(target)
    compressFile(target)
    writeDebugFile(target)
end

puts ""
 
buildInfo= YAML.load_file(ARGV[0]);

if (buildInfo.key?('global options'))
    $globalOptions.merge!(buildInfo['global options']||{})
    buildInfo.delete('global options')
end

if ("jsl"==$globalOptions["packageType"])
    $packageType= $JslPackage
else
    $packageType= $DojoPackage
end

buildInfo.each { |key, value|
    
    target= {
        "include"=>[],
        "exclude"=>[],
        "name"=>key,
        "probedFiles"=>[],
        "orderedFiles"=>[],
        "outputFolder"=>$globalOptions["outputFolder"],
        "version"=>$globalOptions["version"],
        "notice"=>$globalOptions["notice"]
    };

    target.merge!(value)
    processTarget(target)
    
}
