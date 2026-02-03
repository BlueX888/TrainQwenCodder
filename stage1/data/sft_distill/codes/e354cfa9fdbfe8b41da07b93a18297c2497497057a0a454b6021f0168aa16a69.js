class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.sortCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(0, 0, 60, 60);
    graphics.generateTexture('redBox', 60, 60);
    graphics.destroy();

    // 创建15个可拖拽物体
    const startX = 100;
    const startY = 100;
    const spacing = 80;

    for (let i = 0; i < 15; i++) {
      // 随机初始位置
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const obj = this.add.sprite(x, y, 'redBox');
      obj.setInteractive({ draggable: true });
      
      // 添加序号文本
      const text = this.add.text(0, 0, (i + 1).toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 将文本和物体关联
      obj.text = text;
      obj.originalIndex = i;
      
      this.objects.push(obj);
      
      // 更新文本位置
      text.setPosition(obj.x, obj.y);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      // 同步文本位置
      if (gameObject.text) {
        gameObject.text.setPosition(dragX, dragY);
      }
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽时提升层级
      this.children.bringToTop(gameObject);
      if (gameObject.text) {
        this.children.bringToTop(gameObject.text);
      }
      gameObject.setTint(0xffaaaa);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 松手后清除高亮
      gameObject.clearTint();
      
      // 按Y坐标排序
      this.sortObjectsByY();
    });

    // 添加说明文本
    this.add.text(10, 10, 'Drag red boxes to reorder them', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示排序次数
    this.sortCountText = this.add.text(10, 40, `Sort Count: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  sortObjectsByY() {
    // 增加排序计数
    this.sortCount++;
    this.sortCountText.setText(`Sort Count: ${this.sortCount}`);

    // 按Y坐标排序对象数组
    this.objects.sort((a, b) => a.y - b.y);

    // 计算排列位置
    const startX = 400; // 屏幕中心X
    const startY = 80;
    const spacing = 35;

    // 使用动画重新排列
    this.objects.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: obj,
        x: startX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          // 动画过程中同步文本位置
          if (obj.text) {
            obj.text.setPosition(obj.x, obj.y);
          }
        }
      });

      // 同时移动文本
      if (obj.text) {
        this.tweens.add({
          targets: obj.text,
          x: startX,
          y: targetY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    // 在控制台输出排序结果（用于验证）
    console.log('Sorted order (by original index):', 
      this.objects.map(obj => obj.originalIndex + 1));
  }

  update(time, delta) {
    // 每帧更新逻辑（当前不需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene
};

new Phaser.Game(config);