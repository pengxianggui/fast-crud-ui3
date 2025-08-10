# 服务端配置项

`FastCrud`目前涉及的yml配置项只有上传下载涉及的

```yaml
fast-crud:
  host: ${HOST:http://localhost:8080} # 服务地址(本地上传模式文件导出时使用, 指明前端文件访问的绝对地址)
  upload:
    mode: local # 启用本地上传
    local: # 对应fast-crud.upload.mode的值
      dir: ${UPLOAD_DIR:${user.dir}/upload} # 文件上传后在服务端的保存路径
```

`fast-crud.upload.mode`为其它值时，表示启用其它文件服务类。
