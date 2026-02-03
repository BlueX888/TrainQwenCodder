class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：排序次数
    this.objects = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9966ff, 1); // 紫色
    graphics.fillRoundedRect(0, 0, 60, 60, 8);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRoundedRect(0, 0, 60, 60, 8);
    graphics.generateTexture('purpleBox', 60, 60);
    graphics.destroy();

    // 创建 20 个可拖拽物体
    const startX = 100;
    const startY = 100;
    const spacing = 70;

    for (let i = 0; i < 20; i++) {
      // 随机初始位置
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const obj = this.add.sprite(x, y, 'purpleBox');
      obj.setInteractive({ draggable: true });
      obj.setData('index', i);
      obj.setData('originalY', y);
      
      // 添加编号文本
      const text = this.add.text(0, 0, (i + 1).toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 将文本绑定到物体
      obj.setData('text', text);
      this.objects.push(obj);
      
      // 更新文本位置
      text.setPosition(obj.x, obj.y);
    }

    // 拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0xffccff); // 拖拽时高亮
      gameObject.setDepth(1000); // 置顶
      gameObject.getData('text').setDepth(1001);
    });

    // 拖拽中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      // 更新文本位置
      const text = gameObject.getData('text');
      text.setPosition(dragX, dragY);
    });

    // 拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint();
      gameObject.setDepth(0);
      gameObject.getData('text').setDepth(1);
      
      // 触发自动排序
      this.autoSort();
    });

    // 创建状态显示文本
    this.sortCountText = this.add.text(10, 10, 'Sort Count: 0', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(400, 30, 'Drag purple boxes - they will auto-sort by Y position', {
      fontSize: '18px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 初始排序
    this.autoSort();
  }

  autoSort() {
    // 增加排序计数
    this.sortCount++;
    this.sortCountText.setText(`Sort Count: ${this.sortCount}`);

    // 按 Y 坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算排列位置
    const startX = 400;
    const startY = 100;
    const spacing = 25;

    // 使用缓动动画移动到新位置
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: obj,
        x: startX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新文本位置
          const text = obj.getData('text');
          text.setPosition(obj.x, obj.y);
        }
      });

      // 同步移动文本
      const text = obj.getData('text');
      this.tweens.add({
        targets: text,
        x: startX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

new Phaser.Game(config);