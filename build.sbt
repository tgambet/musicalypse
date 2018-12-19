import com.typesafe.sbt.packager.windows.{AddShortCuts, WindowsFeature}
import NativePackagerHelper._
import scala.sys.process._

import scala.sys.process.Process

lazy val akkaHttpVersion = "10.1.5"
lazy val akkaVersion    = "2.5.18"

//val ng = inputKey[Int]("The angular-cli command.")
//val ngBuild = taskKey[Int]("ng build -prod -aot.")
//val jreMappings = taskKey[Seq[(File, String)]]("JRE Mappings for Universal plugin")
//val launch4j = taskKey[Int]("launch4j")
//val Deploy = config("deploy")

lazy val root = (project in file(".")).
  settings(
    name            := "Musicalypse",
    version         := "1.0.0",
    licenses        := Seq("MIT" -> new URL("https://choosealicense.com/licenses/mit/")),
    organization    := "net.creasource",
    scalaVersion    := "2.12.8",
    scalacOptions   := Seq("-unchecked", "-deprecation", "-feature"),
    resolvers       += "jaudiotagger-repository" at "https://dl.bintray.com/ijabz/maven",
    libraryDependencies ++= Seq(
      "com.typesafe.akka" %% "akka-http"            % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-http-spray-json" % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-http-xml"        % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-stream"          % akkaVersion,
      "com.typesafe.akka" %% "akka-actor"           % akkaVersion,
      "com.typesafe.akka" %% "akka-slf4j"           % akkaVersion,
      "ch.qos.logback"    %  "logback-classic"      % "1.2.3",
      "com.mpatric"       %  "mp3agic"              % "0.9.1",
      "net.jthink"        %  "jaudiotagger"         % "2.2.3",

      "com.typesafe.akka" %% "akka-http-testkit"    % akkaHttpVersion % Test,
      "com.typesafe.akka" %% "akka-testkit"         % akkaVersion     % Test,
      "com.typesafe.akka" %% "akka-stream-testkit"  % akkaVersion     % Test,
      "org.scalatest"     %% "scalatest"            % "3.0.4"         % Test
    ),
    unmanagedResourceDirectories in Compile += baseDirectory.value / "config",
    unmanagedResourceDirectories in Compile += target.value / "dist",
//    ng := {
//      import complete.DefaultParsers._
//      val args = spaceDelimited("<arg>").parsed.mkString(" ")
//      val command = {
//        if (System.getProperty("os.name").toLowerCase().contains("win")) {
//          s"powershell -Command ng $args"
//        } else {
//          s"ng $args"
//        }
//      }
//      Process(command, new File(".").getAbsoluteFile).!
//    },
//    ngBuild := {
//      val log = streams.value.log
//      log.info("Building Angular application...")
//      val command = {
//        if (System.getProperty("os.name").toLowerCase().contains("win")) {
//          s"powershell -Command ng build -prod -aot"
//        } else {
//          s"ng build -prod -aot"
//        }
//      }
//      val exitCode = Process(command, new File(".").getAbsoluteFile).!
//      if (exitCode != 0)
//        throw new Exception("Build failed!")
//      exitCode
//    },
    // stage := stage.dependsOn(ngBuild).value,
    // packageSrc in Compile := (packageSrc in Compile).dependsOn(ngBuild).value,

//    (stage in Deploy) := {
//      mappings in Universal in Deploy ++= jreMappings.value
//      stage.value
//    },

    // https://www.scala-sbt.org/sbt-native-packager/formats/universal.html#filter-remove-mappings
    // we specify the name for our fat jar
//    assemblyJarName in assembly := name.value.toLowerCase + "_" + version.value + ".jar",
//    test in assembly := {},
//    // removes all jar mappings in universal and appends the fat jar
//    mappings in Universal := {
//      val universalMappings = (mappings in Universal).value
//      val fatJar = (assembly in Compile).value
//      val filtered = universalMappings filter {
//        case (_, n) => !n.endsWith(".jar")
//      }
//      filtered :+ (fatJar -> ("lib/" + fatJar.getName))
//    },
//    // the bash scripts classpath only needs the fat jar
//    scriptClasspath := Seq((assemblyJarName in assembly).value),
    // Copy the jre folder for bundling with the exe
//    jreMappings := {
//      val dir = file("C:\\Program Files\\Java\\jre1.8.0_161")
//      val jreMappings = (dir ** "*") pair (f => relativeTo(dir)(f).map("jre/" + _))
//      jreMappings
//    },
//    mappings in Universal in Deploy := (mappings in Universal).value,
//    mappings in Universal in Deploy ++= jreMappings.value,
//
//    javaOptions in Universal ++= Seq(
//      "-java-home ${app_home}/../jre"
//    ),

//    launch4j := {
//      // val log = streams.value.log
//      s"launch4j.exe ${file(".").getAbsoluteFile.toString}/l4j.xml".!
//    },

//    mappings in Universal := {
//      val universalMappings = (mappings in Universal).value
//      if ((target.value / "musicalypse.exe").exists())
//        universalMappings :+ (target.value / "musicalypse.exe" -> "musicalypse.exe")
//      else
//        universalMappings
//    },

    // stage := stage.dependsOn(launch4j).value,
//    packageBin in Windows := (packageBin in Windows).dependsOn(launch4j).value,

    // general package information (can be scoped to Windows)
//    maintainer := "Thomas Gambet <thomas.gambet@gmail.com>",
//    packageSummary := "Musicalypse",
//    packageDescription := """An HTML5 audio player.""",
//
//    // wix build information
//    wixProductId := "237e6cfb-fdc6-4727-acee-4ab6f9279aff",
//    wixProductUpgradeId := "3abe2b39-796b-48f3-a0ab-91163f263828",
//
//    wixFeatures += WindowsFeature(
//      id="Shortcut",
//      title="Start menu shortcut",
//      desc="Adds a shortcut to Windows start menu.",
//      components = Seq(AddShortCuts(Seq("musicalypse.exe")))
//    ),

  ).enablePlugins(JavaAppPackaging)
