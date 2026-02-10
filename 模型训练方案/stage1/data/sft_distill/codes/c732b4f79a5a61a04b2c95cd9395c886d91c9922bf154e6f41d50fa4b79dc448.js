class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0; // 状态信号：拖拽次数
    this.items = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFD700, 1); // 金黄色
    graphics.fillRect(0, 0, 80, 60);
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, 80, 60);
    graphics.generateTexture('yellowBox', 80, 60);
    graphics.destroy();

    // 创建8个可拖拽的黄色物体
    const startX = 100;
    const startY = 100;
    const spacing = 70;

    for (let i = 0; i < 8; i++) {
      const item = this.add.sprite(
        startX + (i % 4) * 150,
        startY + Math.floor(i / 4) * spacing,
        'yellowBox'
      );
      
      // 添加序号文本
      const text = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 创建容器组合物体和文本
      const container = this.add.container(item.x, item.y, [item, text]);
      container.setSize(80, 60);
      container.setInteractive({ draggable: true, cursor: 'pointer' });
      
      // 存储初始索引
      container.setData('index', i);
      
      this.items.push(container);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 拖拽时提升层级
      this.children.bringToTop(gameObject);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时放大
      this.tweens.add({
        targets: gameObject,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        ease: 'Power1'
      });
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 拖拽结束时恢复大小
      this.tweens.add({
        targets: gameObject,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power1'
      });

      // 增加拖拽计数
      this.dragCount++;
      this.updateStatusText();

      // 按Y坐标排序并重新排列
      this.sortAndArrangeItems();
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 创建说明文本
    this.add.text(10, 50, '拖拽黄色方块，松手后会按Y坐标自动排列', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
  }

  sortAndArrangeItems() {
    // 按Y坐标排序物体
    const sortedItems = [...this.items].sort((a, b) => a.y - b.y);

    // 计算新的排列位置（4列2行布局）
    const startX = 100;
    const startY = 150;
    const spacingX = 150;
    const spacingY = 100;

    sortedItems.forEach((item, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const targetX = startX + col * spacingX;
      const targetY = startY + row * spacingY;

      // 使用Tween动画移动到新位置
      this.tweens.add({
        targets: item,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          // 动画完成后更新文本显示当前排序
          const textChild = item.list[1];
          if (textChild) {
            const originalIndex = item.getData('index');
            textChild.setText(`#${originalIndex + 1}`);
          }
        }
      });
    });
  }

  updateStatusText() {
    this.statusText.setText(`拖拽次数: ${this.dragCount}`);
  }

  update(time, delta) {
    // 可选的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

new Phaser.Game(config);