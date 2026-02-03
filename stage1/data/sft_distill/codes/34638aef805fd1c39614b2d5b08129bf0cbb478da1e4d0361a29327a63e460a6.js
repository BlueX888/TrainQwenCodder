class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.blocks = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 80, 60);
    graphics.generateTexture('blueBlock', 80, 60);
    graphics.destroy();

    // 创建10个可拖拽的蓝色物体
    const startX = 100;
    const startY = 100;
    const spacing = 70;

    for (let i = 0; i < 10; i++) {
      const block = this.add.image(startX, startY + i * spacing, 'blueBlock');
      
      // 添加文本标签显示编号
      const text = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 创建容器组合图形和文本
      const container = this.add.container(startX, startY + i * spacing, [block, text]);
      container.setSize(80, 60);
      
      // 启用交互和拖拽
      container.setInteractive(
        new Phaser.Geom.Rectangle(-40, -30, 80, 60),
        Phaser.Geom.Rectangle.Contains
      );
      this.input.setDraggable(container);
      
      // 存储原始索引用于显示
      container.setData('index', i + 1);
      
      this.blocks.push(container);
    }

    // 拖拽事件处理
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // 拖拽结束事件 - 触发排序
    this.input.on('dragend', (pointer, gameObject) => {
      this.sortBlocks();
    });

    // 添加说明文本
    this.add.text(300, 50, '拖拽蓝色方块，松手后自动按Y坐标排序', {
      fontSize: '18px',
      color: '#333333'
    });

    // 显示排序次数
    this.sortCountText = this.add.text(300, 100, `排序次数: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#666666'
    });

    // 添加重置按钮
    const resetButton = this.add.text(300, 150, '重置位置', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#e74c3c',
      padding: { x: 10, y: 5 }
    });
    resetButton.setInteractive({ useHandCursor: true });
    resetButton.on('pointerdown', () => {
      this.resetBlocks();
    });
  }

  sortBlocks() {
    // 按Y坐标排序
    this.blocks.sort((a, b) => a.y - b.y);

    // 计算新的位置并使用tween动画移动
    const startX = 100;
    const startY = 100;
    const spacing = 70;

    this.blocks.forEach((block, index) => {
      const targetY = startY + index * spacing;
      
      // 只有位置改变时才执行动画和增加计数
      if (Math.abs(block.y - targetY) > 1) {
        this.tweens.add({
          targets: block,
          x: startX,
          y: targetY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    // 增加排序次数
    this.sortCount++;
    this.sortCountText.setText(`排序次数: ${this.sortCount}`);
    
    console.log('Sorted! Sort count:', this.sortCount);
  }

  resetBlocks() {
    // 随机打乱位置
    const startX = 100;
    const positions = [];
    
    for (let i = 0; i < 10; i++) {
      positions.push(100 + i * 70);
    }
    
    // Fisher-Yates 洗牌算法
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    this.blocks.forEach((block, index) => {
      this.tweens.add({
        targets: block,
        x: startX,
        y: positions[index],
        duration: 400,
        ease: 'Back.easeOut'
      });
    });

    console.log('Reset blocks to random positions');
  }

  update(time, delta) {
    // 可选：添加拖拽时的视觉反馈
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ecf0f1',
  scene: DragSortScene
};

new Phaser.Game(config);