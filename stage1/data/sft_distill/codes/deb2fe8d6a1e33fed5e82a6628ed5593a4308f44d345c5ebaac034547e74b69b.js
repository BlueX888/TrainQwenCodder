class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.items = [];
    this.isDragging = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      itemCount: 8,
      sortedOrder: [],
      dragCount: 0,
      sortCount: 0
    };

    // 创建粉色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillRoundedRect(0, 0, 80, 60, 10);
    graphics.generateTexture('pinkBox', 80, 60);
    graphics.destroy();

    // 创建8个可拖拽物体
    const startX = 150;
    const startY = 100;
    const spacing = 80;

    for (let i = 0; i < 8; i++) {
      const item = this.add.sprite(
        startX + (i % 4) * spacing,
        startY + Math.floor(i / 4) * spacing,
        'pinkBox'
      );

      // 添加序号文本
      const text = this.add.text(0, 0, `${i + 1}`, {
        fontSize: '24px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);

      // 创建容器组合sprite和text
      const container = this.add.container(item.x, item.y, [item, text]);
      container.setSize(80, 60);
      container.setData('id', i);
      container.setData('originalY', container.y);

      // 设置为可交互和可拖拽
      container.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 80, 60),
        Phaser.Geom.Rectangle.Contains
      );
      this.input.setDraggable(container);

      this.items.push(container);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      this.isDragging = true;
      gameObject.setScale(1.1); // 拖拽时放大
      gameObject.setDepth(100); // 置顶显示
      window.__signals__.dragCount++;
    });

    // 监听拖拽中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      this.isDragging = false;
      gameObject.setScale(1); // 恢复原大小
      gameObject.setDepth(0);

      // 按Y坐标排序并重新排列
      this.sortAndArrangeItems();
    });

    // 添加说明文字
    this.add.text(400, 30, '拖动粉色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#FF69B4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  sortAndArrangeItems() {
    // 按Y坐标排序
    const sortedItems = [...this.items].sort((a, b) => a.y - b.y);

    // 记录排序后的ID顺序
    window.__signals__.sortedOrder = sortedItems.map(item => item.getData('id'));
    window.__signals__.sortCount++;

    // 计算新位置（4列2行布局）
    const startX = 150;
    const startY = 200;
    const spacingX = 100;
    const spacingY = 100;

    sortedItems.forEach((item, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const newX = startX + col * spacingX;
      const newY = startY + row * spacingY;

      // 使用Tween动画移动到新位置
      this.tweens.add({
        targets: item,
        x: newX,
        y: newY,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          this.updateStatusText();
        }
      });
    });

    // 输出排序日志
    console.log(JSON.stringify({
      event: 'sorted',
      order: window.__signals__.sortedOrder,
      timestamp: Date.now()
    }));
  }

  updateStatusText() {
    const order = window.__signals__.sortedOrder.map(id => id + 1).join(', ');
    this.statusText.setText(
      `拖拽次数: ${window.__signals__.dragCount} | 排序次数: ${window.__signals__.sortCount}\n` +
      `当前顺序: ${order || '未排序'}`
    );
  }

  update(time, delta) {
    // 每帧更新（如需要）
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

const game = new Phaser.Game(config);