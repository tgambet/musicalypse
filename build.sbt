import scala.sys.process.Process

lazy val akkaHttpVersion = "10.0.10"
lazy val akkaVersion    = "2.5.6"

val ng = inputKey[Int]("The angular-cli command.")
val ngBuild = taskKey[Int]("ng build -prod -aot.")

lazy val root = (project in file(".")).
  settings(
    name            := "Akka Http Angular",
    version         := "0.1",
    licenses        := Seq("Unlicense" -> new URL("http://unlicense.org/")),
    organization    := "net.creasource",
    scalaVersion    := "2.12.4",
    scalacOptions   := Seq("-unchecked", "-deprecation", "-feature"),
    libraryDependencies ++= Seq(
      "com.typesafe.akka" %% "akka-http"            % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-http-spray-json" % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-http-xml"        % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-stream"          % akkaVersion,
      "com.typesafe.akka" %% "akka-actor"           % akkaVersion,
      "com.typesafe.akka" %% "akka-slf4j"           % akkaVersion,
      "ch.qos.logback"    %  "logback-classic"      % "1.2.3",

      "com.typesafe.akka" %% "akka-http-testkit"    % akkaHttpVersion % Test,
      "com.typesafe.akka" %% "akka-testkit"         % akkaVersion     % Test,
      "com.typesafe.akka" %% "akka-stream-testkit"  % akkaVersion     % Test,
      "org.scalatest"     %% "scalatest"            % "3.0.4"         % Test
    ),
    unmanagedResourceDirectories in Compile += baseDirectory.value / "config",
    unmanagedResourceDirectories in Compile += baseDirectory.value / "web" / "resources",
    ng := {
      import complete.DefaultParsers._
      val args = spaceDelimited("<arg>").parsed.mkString(" ")
      val command = {
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
          s"powershell -Command ng $args"
        } else {
          s"ng $args"
        }
      }
      Process(command, new File(".").getAbsoluteFile).!
    },
    ngBuild := {
      val log = streams.value.log
      log.info("Building Angular application...")
      val command = {
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
          s"powershell -Command ng build -prod -aot"
        } else {
          s"ng build -prod -aot"
        }
      }
      val exitCode = Process(command, new File(".").getAbsoluteFile).!
      if (exitCode != 0)
        throw new Exception("Build failed!")
      exitCode
    },
    stage := stage.dependsOn(ngBuild).value
  ).enablePlugins(JavaAppPackaging)