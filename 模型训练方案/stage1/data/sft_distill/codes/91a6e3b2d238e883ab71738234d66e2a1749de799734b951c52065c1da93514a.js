class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.boxes = [];
    this.dragCount = 0;
    this.sortCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      dragCount: 0,
      sortCount: 0,
      currentOrder: [],
      lastSortTime: 0
    };

    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 100, 100);
    graphics.generateTexture('whiteBox', 100, 100);
    graphics.destroy();

    // 创建3个可拖拽的白色方块
    const startX = 400;
    const startYPositions = [150, 300, 450];

    for (let i = 0; i < 3; i++) {
      const box = this.add.sprite(startX, startYPositions[i], 'whiteBox');
      box.setInteractive({ draggable: true });
      box.setData('id', i); // 给每个方块一个ID
      this.boxes.push(box);

      // 添加边框以便区分
      const border = this.add.graphics();
      border.lineStyle(3, 0x000000, 1);
      border.strokeRect(box.x - 50, box.y - 50, 100, 100);
      box.setData('border', border);

      // 添加序号文本
      const text = this.add.text(box.x, box.y, `Box ${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        align: 'center'
      }).setOrigin(0.5);
      box.setData('text', text);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0xcccccc); // 拖拽时变灰
      this.dragCount++;
      window.__signals__.dragCount = this.dragCount;
      console.log(JSON.stringify({
        event: 'dragstart',
        boxId: gameObject.getData('id'),
        dragCount: this.dragCount
      }));
    });

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;

      // 更新边框和文本位置
      const border = gameObject.getData('border');
      const text = gameObject.getData('text');
      border.clear();
      border.lineStyle(3, 0x000000, 1);
      border.strokeRect(dragX - 50, dragY - 50, 100, 100);
      text.setPosition(dragX, dragY);
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint(); // 恢复颜色
      
      console.log(JSON.stringify({
        event: 'dragend',
        boxId: gameObject.getData('id'),
        position: { x: gameObject.x, y: gameObject.y }
      }));

      // 松手后自动排序
      this.sortBoxesByY();
    });

    // 添加说明文本
    this.add.text(400, 50, 'Drag the white boxes to reorder them', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 580, 'Boxes will auto-sort by Y position when released', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 初始化排序顺序
    this.updateSignals();
  }

  sortBoxesByY() {
    // 按Y坐标排序
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);

    // 计算新的Y位置（均匀分布）
    const targetYPositions = [150, 300, 450];

    // 使用Tween动画移动到新位置
    sortedBoxes.forEach((box, index) => {
      const targetY = targetYPositions[index];
      const targetX = 400; // 保持X坐标居中

      // 如果位置需要改变，则创建动画
      if (box.x !== targetX || box.y !== targetY) {
        this.tweens.add({
          targets: box,
          x: targetX,
          y: targetY,
          duration: 300,
          ease: 'Power2',
          onUpdate: () => {
            // 更新边框和文本位置
            const border = box.getData('border');
            const text = box.getData('text');
            border.clear();
            border.lineStyle(3, 0x000000, 1);
            border.strokeRect(box.x - 50, box.y - 50, 100, 100);
            text.setPosition(box.x, box.y);
          },
          onComplete: () => {
            // 更新信号
            this.updateSignals();
          }
        });
      }
    });

    this.sortCount++;
    window.__signals__.sortCount = this.sortCount;
    window.__signals__.lastSortTime = Date.now();

    console.log(JSON.stringify({
      event: 'sort',
      sortCount: this.sortCount,
      newOrder: sortedBoxes.map(box => box.getData('id'))
    }));
  }

  updateSignals() {
    // 更新当前排序顺序（从上到下）
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    window.__signals__.currentOrder = sortedBoxes.map(box => box.getData('id'));
    
    console.log(JSON.stringify({
      event: 'orderUpdate',
      currentOrder: window.__signals__.currentOrder,
      dragCount: this.dragCount,
      sortCount: this.sortCount
    }));
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);