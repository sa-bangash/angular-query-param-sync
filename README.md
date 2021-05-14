### Usage

```ts
import { ParamSyncFactory } from "../param-sync/param-sync-factory";
import { ParamSyncController } from "../param-sync/param-sync.controller";
import { CONTROL_TYPES } from "../param-sync/utils";

@Component({
  selector: "app-Demo",
  templateUrl: "./Demo.component.html",
  styleUrls: ["./Demo.component.css"],
})
export class DemoComponent implements OnInit {
  form: FormGroup;
  queryParamFilter: ParamSyncController;

  constructor(
    private fb: FormBuilder,
    public queryParamSyncFactory: ParamSyncFactory
  ) {
    this.form = this.fb.group({
      search: [],
      date: [],
    });
    this.initQueryParam();

    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {
        // do what you want
      });
  }

  async initQueryParam() {
    this.queryParamFilter = await this.queryParamSyncFactory
      .create({
        source: this.form,
        storageName: "Demo",
        config: [
          {
            queryName: "query",
            type: CONTROL_TYPES.STRING,
            path:'search'
          },
          {
            queryName: "date",
            parse: (value) => {
              if(value){
                  return new Date(value)
              }
              return value;
            },
            serializer:(value)=>{
              if(value instanceOf Date){
                  return value.toString();
              }
              return value;
            }
          },
        ],
      })
     await this.queryParamFilter.sync();
  }

   ngOnDestroy(): void {
    this.queryParamFilter.destory(); // this importent part
  }

}
```

### queryName

    Name that will be appear in url and if __ path __ is not provide than it should be same as form field.

### path

    Some time need to provide different key in url so `path` is refer to form field should be use along with `queryName'.

### type

    Refer to parse data from url to form. like we have type CONTROL_TYPES.NUMBER which take value from url as string and parse to number for form. there amy other types.

    1. CONTROL_TYPES.ARRAY
    2. CONTROL_TYPES.INT_ARRAY
    3. CONTROL_TYPES.BOOLEAN

### parse

    Refer to provide custom parser instead of defining `type`. so actullay ovride the default parse that we provide in type.

### storageName

    Provide storageName if you want to store data in local storage other wise it will not store.

### sync()

    You need to called once when you ready to sync data.

### destory

    you we need to clean up memory by calling destory method.
