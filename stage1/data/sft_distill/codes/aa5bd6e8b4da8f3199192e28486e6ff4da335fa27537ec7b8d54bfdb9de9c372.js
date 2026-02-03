class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：记录排序次数
    this.objects = []; // 存储所有可拖拽物体
  }

  preload() {
    // 使用Graphics创建红色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 80, 60);
    graphics.generateTexture('redBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, '拖拽红色物体，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 60, '排序次数: 0', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建10个红色可拖拽物体
    const startX = 400;
    const startY = 120;
    const spacing = 65;

    for (let i = 0; i < 10; i++) {
      const obj = this.add.sprite(startX, startY + i * spacing, 'redBox');
      
      // 添加编号文本
      const label = this.add.text(startX, startY + i * spacing, `${i + 1}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 将文本绑定到物体上
      obj.label = label;
      obj.index = i;

      // 启用交互和拖拽
      obj.setInteractive({ draggable: true, useHandCursor: true });
      
      this.objects.push(obj);
    }

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步更新文本位置
      if (gameObject.label) {
        gameObject.label.x = dragX;
        gameObject.label.y = dragY;
      }
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      this.sortObjectsByY();
    });

    // 添加说明文本
    this.add.text(400, 580, '提示：拖动任意红色方块，松手后所有方块会按Y坐标自动排列', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  sortObjectsByY() {
    // 按当前Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算新的Y位置
    const startY = 120;
    const spacing = 65;

    // 增加排序计数
    this.sortCount++;
    this.statusText.setText(`排序次数: ${this.sortCount}`);

    // 使用Tween动画移动到新位置
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      const targetX = 400; // 统一X坐标

      // 物体动画
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });

      // 文本动画
      if (obj.label) {
        this.tweens.add({
          targets: obj.label,
          x: targetX,
          y: targetY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    // 输出排序后的顺序到控制台（用于验证）
    console.log('排序后顺序:', sorted.map(obj => obj.index + 1).join(', '));
    console.log('总排序次数:', this.sortCount);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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