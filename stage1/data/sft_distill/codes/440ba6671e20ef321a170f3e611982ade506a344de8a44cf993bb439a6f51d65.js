class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.dragCount = 0;
    this.sortCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      dragCount: 0,
      sortCount: 0,
      objectPositions: []
    };

    // 创建标题文本
    this.add.text(400, 30, '拖拽黄色圆形，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建统计信息文本
    this.statsText = this.add.text(400, 60, '', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建 20 个黄色圆形物体
    const radius = 20;
    const colors = [0xffff00, 0xffd700, 0xffcc00]; // 不同深浅的黄色

    for (let i = 0; i < 20; i++) {
      // 随机位置（避免重叠）
      const x = 100 + (i % 5) * 140 + Math.random() * 40;
      const y = 120 + Math.floor(i / 5) * 120 + Math.random() * 40;

      // 创建 Graphics 对象
      const graphics = this.add.graphics();
      const color = colors[i % colors.length];
      graphics.fillStyle(color, 1);
      graphics.fillCircle(0, 0, radius);
      graphics.lineStyle(2, 0x000000, 1);
      graphics.strokeCircle(0, 0, radius);

      // 生成纹理
      graphics.generateTexture(`circle_${i}`, radius * 2, radius * 2);
      graphics.destroy();

      // 创建精灵
      const sprite = this.add.sprite(x, y, `circle_${i}`);
      sprite.setInteractive({ draggable: true, cursor: 'pointer' });
      sprite.originalIndex = i;
      sprite.setData('id', i);

      // 添加编号文本
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '14px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 将文本作为子对象绑定到精灵
      sprite.text = text;

      this.objects.push(sprite);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      // 同步文本位置
      if (gameObject.text) {
        gameObject.text.x = dragX;
        gameObject.text.y = dragY;
      }
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时提升层级和缩放
      gameObject.setScale(1.2);
      gameObject.setDepth(100);
      if (gameObject.text) {
        gameObject.text.setDepth(101);
      }
      this.dragCount++;
      this.updateStats();
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复缩放
      gameObject.setScale(1);
      gameObject.setDepth(0);
      if (gameObject.text) {
        gameObject.text.setDepth(1);
      }

      // 触发排序
      this.sortObjectsByY();
    });

    this.updateStats();
    this.updateSignals();
  }

  sortObjectsByY() {
    // 按当前 Y 坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算新的排列位置（垂直排列，左对齐）
    const startX = 100;
    const startY = 120;
    const spacing = 40;

    sorted.forEach((obj, index) => {
      const targetX = startX + (index % 10) * 70; // 每行 10 个
      const targetY = startY + Math.floor(index / 10) * spacing;

      // 使用 Tween 动画移动到新位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          // 同步文本位置
          if (obj.text) {
            obj.text.x = obj.x;
            obj.text.y = obj.y;
          }
        }
      });

      // 同时移动文本
      if (obj.text) {
        this.tweens.add({
          targets: obj.text,
          x: targetX,
          y: targetY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    this.sortCount++;
    this.updateStats();
    this.updateSignals();

    // 输出排序日志
    console.log(JSON.stringify({
      event: 'sort',
      sortCount: this.sortCount,
      order: sorted.map(obj => obj.getData('id'))
    }));
  }

  updateStats() {
    this.statsText.setText(`拖拽次数: ${this.dragCount} | 排序次数: ${this.sortCount}`);
  }

  updateSignals() {
    window.__signals__ = {
      dragCount: this.dragCount,
      sortCount: this.sortCount,
      objectPositions: this.objects.map(obj => ({
        id: obj.getData('id'),
        x: Math.round(obj.x),
        y: Math.round(obj.y)
      }))
    };
  }

  update() {
    // 实时更新 signals（可选）
    if (this.time.now % 100 < 16) { // 大约每 100ms 更新一次
      this.updateSignals();
    }
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

// 输出初始状态
console.log(JSON.stringify({
  event: 'init',
  message: 'Drag sort game initialized with 20 objects'
}));