class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.generateTexture('whiteBox', 60, 60);
    graphics.destroy();

    // 创建10个可拖拽的白色方块
    const startX = 100;
    const spacing = 70;
    
    for (let i = 0; i < 10; i++) {
      // 随机Y坐标分布
      const x = startX + (i % 5) * spacing;
      const y = 100 + Math.floor(i / 5) * 250 + Math.random() * 150;
      
      const box = this.add.sprite(x, y, 'whiteBox');
      box.setInteractive({ draggable: true });
      box.setData('index', i); // 记录初始索引
      
      // 添加文本标签显示索引
      const text = this.add.text(0, 0, `${i}`, {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 将文本作为子对象
      box.text = text;
      this.updateTextPosition(box);
      
      this.objects.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      this.updateTextPosition(gameObject);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(400, 30, '拖拽方块后松手，将按Y坐标自动排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortCountText = this.add.text(400, 560, `排序次数: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  updateTextPosition(box) {
    if (box.text) {
      box.text.x = box.x;
      box.text.y = box.y;
    }
  }

  sortObjects() {
    // 按Y坐标排序
    this.objects.sort((a, b) => a.y - b.y);
    
    // 增加排序计数
    this.sortCount++;
    this.sortCountText.setText(`排序次数: ${this.sortCount}`);
    
    // 计算新的排列位置（垂直居中排列）
    const startY = 120;
    const spacing = 45;
    const startX = 400;
    
    // 使用缓动动画移动到新位置
    this.objects.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: obj,
        x: startX,
        y: targetY,
        duration: 400,
        ease: 'Power2',
        onUpdate: () => {
          this.updateTextPosition(obj);
        }
      });
      
      // 同时移动文本
      if (obj.text) {
        this.tweens.add({
          targets: obj.text,
          x: startX,
          y: targetY,
          duration: 400,
          ease: 'Power2'
        });
      }
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（本例不需要）
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