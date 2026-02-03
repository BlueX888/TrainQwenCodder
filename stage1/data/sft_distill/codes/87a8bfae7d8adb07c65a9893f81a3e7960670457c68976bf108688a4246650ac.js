class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：排序次数
    this.objects = [];
    this.targetPositions = []; // 目标位置数组
  }

  preload() {
    // 创建黄色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillRoundedRect(0, 0, 100, 60, 8);
    graphics.lineStyle(3, 0xFFA500, 1);
    graphics.strokeRoundedRect(0, 0, 100, 60, 8);
    graphics.generateTexture('yellowBox', 100, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文字
    this.add.text(400, 30, '拖拽黄色物体，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortText = this.add.text(400, 60, `排序次数: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 初始化目标位置（垂直排列的固定X坐标位置）
    const startY = 120;
    const spacing = 90;
    for (let i = 0; i < 5; i++) {
      this.targetPositions.push({
        x: 400,
        y: startY + i * spacing
      });
    }

    // 创建5个黄色物体，初始位置随机分散
    const initialPositions = [
      { x: 200, y: 200 },
      { x: 600, y: 350 },
      { x: 300, y: 450 },
      { x: 500, y: 150 },
      { x: 400, y: 500 }
    ];

    for (let i = 0; i < 5; i++) {
      const obj = this.add.sprite(
        initialPositions[i].x,
        initialPositions[i].y,
        'yellowBox'
      );
      
      // 添加序号文字
      const text = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 创建容器来组合sprite和文字
      const container = this.add.container(
        initialPositions[i].x,
        initialPositions[i].y,
        [obj, text]
      );

      // 设置容器大小用于交互
      container.setSize(100, 60);
      
      // 启用交互和拖拽
      container.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 100, 60),
        Phaser.Geom.Rectangle.Contains
      );
      this.input.setDraggable(container);

      // 保存原始索引
      container.setData('originalIndex', i);
      container.setData('isDragging', false);

      this.objects.push(container);
    }

    // 拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setData('isDragging', true);
      // 提升层级
      this.children.bringToTop(gameObject);
      // 缩放效果
      this.tweens.add({
        targets: gameObject,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        ease: 'Power2'
      });
    });

    // 拖拽中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // 拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setData('isDragging', false);
      
      // 恢复缩放
      this.tweens.add({
        targets: gameObject,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2'
      });

      // 触发排序
      this.sortObjects();
    });

    // 添加提示信息
    this.add.text(400, 570, '提示：拖动任意物体后松手，所有物体将按Y坐标自动排序', {
      fontSize: '14px',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);
  }

  sortObjects() {
    // 增加排序计数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);

    // 按当前Y坐标排序
    const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);

    // 为每个物体分配新位置并执行动画
    sortedObjects.forEach((obj, index) => {
      const targetPos = this.targetPositions[index];
      
      // 创建移动动画
      this.tweens.add({
        targets: obj,
        x: targetPos.x,
        y: targetPos.y,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          // 动画完成后的反馈效果
          this.tweens.add({
            targets: obj,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
          });
        }
      });
    });

    // 输出排序结果到控制台（用于验证）
    console.log('排序完成，当前顺序（从上到下）：');
    sortedObjects.forEach((obj, index) => {
      const originalIndex = obj.getData('originalIndex');
      console.log(`位置${index + 1}: 物体#${originalIndex + 1} (Y=${Math.round(obj.y)})`);
    });
  }

  update(time, delta) {
    // 为正在拖拽的物体添加视觉效果
    this.objects.forEach(obj => {
      if (obj.getData('isDragging')) {
        // 可以在这里添加额外的拖拽效果
      }
    });
  }
}

// 游戏配置
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