class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：记录排序次数
    this.objects = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景提示文字
    this.add.text(400, 30, 'Drag and Drop to Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortCountText = this.add.text(400, 60, `Sort Count: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建白色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 60, 40);
    graphics.generateTexture('whiteBox', 60, 40);
    graphics.destroy();

    // 创建15个可拖拽的白色物体
    for (let i = 0; i < 15; i++) {
      // 随机位置（避开顶部文字区域）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(120, 550);
      
      // 创建物体容器
      const container = this.add.container(x, y);
      
      // 添加白色矩形
      const box = this.add.image(0, 0, 'whiteBox');
      
      // 添加索引文字（黑色）
      const text = this.add.text(0, 0, `${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      container.add([box, text]);
      container.setSize(60, 40);
      
      // 启用交互和拖拽
      container.setInteractive({ draggable: true, cursor: 'pointer' });
      
      // 添加到物体数组
      this.objects.push(container);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      // 提升拖拽物体的深度，使其显示在最上层
      gameObject.setDepth(1000);
      // 添加视觉反馈
      gameObject.setScale(1.1);
      gameObject.setAlpha(0.8);
    });

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // 更新物体位置
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复视觉状态
      gameObject.setDepth(0);
      gameObject.setScale(1);
      gameObject.setAlpha(1);
      
      // 执行排序
      this.sortObjectsByY();
    });

    // 添加说明文字
    this.add.text(400, 580, 'Objects will auto-arrange by Y position after drag', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  sortObjectsByY() {
    // 增加排序计数
    this.sortCount++;
    this.sortCountText.setText(`Sort Count: ${this.sortCount}`);

    // 按Y坐标排序物体数组
    const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算排列位置（垂直排列在画布中央）
    const startX = 400;
    const startY = 120;
    const spacing = 30; // 物体间距

    // 使用Tween动画移动到目标位置
    sortedObjects.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: obj,
        x: startX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onStart: () => {
          // 动画开始时禁用拖拽
          obj.disableInteractive();
        },
        onComplete: () => {
          // 动画完成后重新启用拖拽
          obj.setInteractive({ draggable: true, cursor: 'pointer' });
        }
      });
    });

    // 输出排序结果到控制台（便于验证）
    console.log('Sorted Y positions:', sortedObjects.map(obj => Math.round(obj.y)));
  }

  update(time, delta) {
    // 本示例不需要持续更新逻辑
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
new Phaser.Game(config);