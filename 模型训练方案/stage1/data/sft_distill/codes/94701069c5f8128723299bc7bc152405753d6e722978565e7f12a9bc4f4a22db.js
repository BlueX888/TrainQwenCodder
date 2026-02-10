class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号
    this.objects = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建绿色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 80, 50);
    graphics.generateTexture('greenBox', 80, 50);
    graphics.destroy();

    // 创建20个可拖拽的绿色物体
    const startX = 100;
    const startY = 50;
    const spacing = 25;

    for (let i = 0; i < 20; i++) {
      const x = startX + (i % 4) * 150; // 4列布局
      const y = startY + Math.floor(i / 4) * spacing;
      
      const obj = this.add.image(x, y, 'greenBox');
      obj.setInteractive({ draggable: true });
      obj.setData('index', i); // 存储原始索引
      
      // 添加文本标签显示索引
      const text = this.add.text(x, y, `#${i}`, {
        fontSize: '16px',
        color: '#000000',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      obj.setData('label', text);
      
      this.objects.push(obj);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步移动文本标签
      const label = gameObject.getData('label');
      if (label) {
        label.x = dragX;
        label.y = dragY;
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(10, 10, 'Drag green boxes to reorder them by Y position', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示排序次数
    this.sortCountText = this.add.text(10, 560, `Sort Count: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  sortObjects() {
    // 按Y坐标排序
    this.objects.sort((a, b) => a.y - b.y);

    // 计算新的排列位置
    const startX = 400;
    const startY = 100;
    const spacing = 25;

    // 使用动画移动到新位置
    this.objects.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      const targetX = startX;

      // 物体移动动画
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });

      // 文本标签移动动画
      const label = obj.getData('label');
      if (label) {
        this.tweens.add({
          targets: label,
          x: targetX,
          y: targetY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    // 增加排序计数
    this.sortCount++;
    this.sortCountText.setText(`Sort Count: ${this.sortCount}`);
    
    console.log(`Sorted! Count: ${this.sortCount}`);
  }

  update(time, delta) {
    // 可选：添加额外的更新逻辑
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