class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 验证状态：排序次数
    this.objects = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('orangeCircle', 50, 50);
    graphics.destroy();

    // 创建15个橙色物体
    const startX = 100;
    const startY = 100;
    const spacing = 40;

    for (let i = 0; i < 15; i++) {
      const x = startX + (i % 5) * 120;
      const y = startY + Math.floor(i / 5) * 120;
      
      const obj = this.add.image(x, y, 'orangeCircle');
      obj.setInteractive({ draggable: true });
      obj.setData('id', i); // 存储物体ID
      
      // 添加文本标签显示ID
      const text = this.add.text(x, y, i.toString(), {
        fontSize: '20px',
        color: '#fff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      obj.setData('label', text);
      
      this.objects.push(obj);
    }

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步移动文本标签
      const label = gameObject.getData('label');
      label.x = dragX;
      label.y = dragY;
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      this.sortObjects();
    });

    // 添加说明文字
    this.add.text(10, 10, 'Drag circles to reorder them by Y position', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示排序次数
    this.sortCountText = this.add.text(10, 550, `Sort Count: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  sortObjects() {
    // 按Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新的排列位置（3列5行）
    const startX = 200;
    const startY = 150;
    const spacingX = 120;
    const spacingY = 100;
    
    sorted.forEach((obj, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const targetX = startX + col * spacingX;
      const targetY = startY + row * spacingY;
      
      // 使用Tween平滑移动到新位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
      
      // 同步移动文本标签
      const label = obj.getData('label');
      this.tweens.add({
        targets: label,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });
    
    // 增加排序次数
    this.sortCount++;
    this.sortCountText.setText(`Sort Count: ${this.sortCount}`);
    
    console.log(`Sorted! Count: ${this.sortCount}`);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene
};

new Phaser.Game(config);