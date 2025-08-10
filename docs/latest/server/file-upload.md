# 文件上传

`FastTable`中涉及上传的列组件有`FastTableColumnFile`和`FastTableColumnImg`,
上传接口为[标准Rest接口](/latest/server/standard-api)中的"上传"接口。

上传涉及一些配置项, 可通过yml配置。 以下是完整配置demo:

```yml
fast-crud:
  host: ${HOST:http://localhost:8080} # 服务地址(本地上传模式文件导出时使用, 指明前端文件访问的绝对地址)
  upload:
    mode: local # 启用本地上传
    local: # 对应fast-crud.upload.mode的值
      dir: ${UPLOAD_DIR:${user.dir}/upload} # 文件上传后在服务端的保存路径
```

## 本地上传

上面的demo表示启用本地上传(`fast-crud.upload.mode=local`), 本地上传路径为`${UPLOAD_DIR:${user.dir}/upload}`。
FastCrud默认会在此路径下按日期`yyyyMMdd`分文件夹存放。当前也可以在自定义:

```java
@Service
public class StudentServiceImpl extends BaseServiceImpl<StudentMapper, Student> {
    
    @Override
    public String upload(String row, String col, MultipartFile file) throws IOException {
        return fileManager.getFileService().upload(file, DateUtils.format(new Date(), "yyyyMMdd"), "student");
    }
}
```

如此, 便可以上传到`${UPLOAD_DIR:${user.dir}/upload}/{yyyyMMdd}/student/` 目录下

## OSS上传

FastCrud默认没有实现OSS上传, 需要自行实现`FileService`接口类，例如:

```java
@Component // 自动注册为bean, FastCrud才会自动识别
public class AliyunOssFileService implements FileServce {
    
    @Override
    public String getMode() {
        return "aliyunoss";
    }
    
    @Override
    public String upload(MultipartFile file, String... splitMarkers) throws IOException {
        // 此处自行实现uploadToAliyunOss: 将file上传至aliyun oss并返回绝对访问地址
        return uploadToAliyunOss(file);
    }
    
    @Override
    public File getFile(String fileUrl) {
        // 此处自行实现从aliyunoss获取文件。通常情况下前端展示的文件是绝对地址，无需经过当前服务端，这时这个方法也可以不实现。
        return getFileFromAliyunOss(fileUrl); 
    }
}
```

此时，如果要启用此文件服务类，还差一个步骤就是yml启用：

```yml
fast-crud:
  upload:
    mode: aliyunoss # 启用阿里云oss上传
```

`fast-crud.upload.mode`值必须和`getMode`返回的值一致。

更多详情请查看[FileService](https://github.com/pengxianggui/fast-crud/blob/main/fast-crud-spring-boot-starter/src/main/java/io/github/pengxianggui/crud/file/FileService.java)和[FileManager](https://github.com/pengxianggui/fast-crud/blob/main/fast-crud-spring-boot-starter/src/main/java/io/github/pengxianggui/crud/file/FileManager.java)
