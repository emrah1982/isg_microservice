# build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy sln and restore
COPY ISG-Microservices.sln ./
COPY src/ExamsService/ExamsService.csproj src/ExamsService/
RUN dotnet restore src/ExamsService/ExamsService.csproj

# copy all and publish
COPY src/ExamsService/ src/ExamsService/
RUN dotnet publish src/ExamsService/ExamsService.csproj -c Release -o /app/publish

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8087
ENV ASPNETCORE_URLS=http://+:8087
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ExamsService.dll"]
