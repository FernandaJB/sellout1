# To change this license header, choose License Headers in Project Properties.
# To change this template file, choose Tools | Templates
# and open the template in the editor.
FROM openjdk:17-jdk-alpine
RUN addgroup -S puntometro && adduser -S admin -G puntometro
USER admin:puntometro
VOLUME /tmp
COPY target/apigateway-1.0.jar app.jar
ENV JAVA_OPTS=""
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app.jar" ]