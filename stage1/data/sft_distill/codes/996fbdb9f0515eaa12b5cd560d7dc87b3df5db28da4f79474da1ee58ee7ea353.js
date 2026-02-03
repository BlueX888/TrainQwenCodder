class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建灰色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 60, 40);
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, 60, 40);
    graphics.generateTexture('grayBox', 60, 40);
    graphics.destroy();

    // 创建20个可拖拽的物体
    const startX = 100;
    const startY = 50;
    const spacing = 45;

    for (let i = 0; i < 20; i++) {
      const x = startX + (i % 5) * 150;
      const y = startY + Math.floor(i / 5) * spacing;
      
      const obj = this.add.sprite(x, y, 'grayBox');
      obj.setInteractive({ draggable: true });
      obj.originalIndex = i;
      
      // 添加文本标签显示序号
      const text = this.add.text(x, y, `${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      obj.label = text;
      this.objects.push(obj);
    }

    // 拖拽事件处理
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.label.x = dragX;
      gameObject.label.y = dragY;
      
      // 拖拽时提升层级
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.label);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 松手后触发排序
      this.sortObjectsByY();
    });

    // 显示排序次数
    this.sortText = this.add.text(10, 10, `Sort Count: ${this.sortCount}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明
    this.add.text(10, 550, 'Drag any box and release to sort by Y position', {
      fontSize: '16px',
      color: '#ffff00'
    });
  }

  sortObjectsByY() {
    // 按Y坐标排序
    this.objects.sort((a, b) => a.y - b.y);

    // 更新排序次数
    this.sortCount++;
    this.sortText.setText(`Sort Count: ${this.sortCount}`);

    // 计算新位置并应用动画
    const startX = 100;
    const startY = 50;
    const spacing = 45;

    this.objects.forEach((obj, index) => {
      const targetX = startX + (index % 5) * 150;
      const targetY = startY + Math.floor(index / 5) * spacing;

      // 使用Tween平滑移动到新位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });

      // 同时移动标签
      this.tweens.add({
        targets: obj.label,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });

    // 控制台输出当前排序结果（用于验证）
    console.log('Sorted order (original indices):', 
      this.objects.map(obj => obj.originalIndex + 1));
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
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