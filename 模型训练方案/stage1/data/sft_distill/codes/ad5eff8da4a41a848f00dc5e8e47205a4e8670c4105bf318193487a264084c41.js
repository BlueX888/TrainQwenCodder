class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = []; // 存储所有可拖拽对象
  }

  preload() {
    // 不需要加载外部资源
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

    // 创建15个可拖拽的红色方块
    for (let i = 0; i < 15; i++) {
      // 随机位置
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const box = this.add.sprite(x, y, 'redBox');
      box.setInteractive({ draggable: true });
      
      // 添加编号文本
      const text = this.add.text(0, 0, (i + 1).toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 创建容器将方块和文本组合
      const container = this.add.container(x, y, [box, text]);
      container.setSize(60, 60);
      container.setInteractive({ draggable: true });
      
      // 存储原始精灵引用用于排序
      container.sprite = box;
      container.index = i;
      
      this.objects.push(container);
      
      // 拖拽开始
      container.on('dragstart', (pointer) => {
        container.setDepth(1);
        box.setTint(0xffaaaa);
      });
      
      // 拖拽中
      container.on('drag', (pointer, dragX, dragY) => {
        container.x = dragX;
        container.y = dragY;
      });
      
      // 拖拽结束
      container.on('dragend', (pointer) => {
        container.setDepth(0);
        box.clearTint();
        this.sortObjects();
      });
    }

    // 添加说明文本
    this.add.text(400, 30, '拖拽红色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortCountText = this.add.text(400, 570, '排序次数: 0', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);
  }

  sortObjects() {
    // 按当前Y坐标排序
    this.objects.sort((a, b) => a.y - b.y);
    
    // 增加排序计数
    this.sortCount++;
    this.sortCountText.setText(`排序次数: ${this.sortCount}`);
    
    // 计算排列位置（垂直居中排列）
    const startY = 100;
    const spacing = 30;
    
    // 使用缓动动画移动到新位置
    this.objects.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      const targetX = 400; // 水平居中
      
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          // 动画完成后确保深度正确
          obj.setDepth(0);
        }
      });
    });
    
    // 输出当前排序状态到控制台（用于验证）
    console.log('排序后顺序(索引):', this.objects.map(obj => obj.index));
    console.log('排序次数:', this.sortCount);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
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