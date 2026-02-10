class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.boxes = [];
    this.sortCount = 0; // 验证信号：记录排序次数
  }

  preload() {
    // 使用 Graphics 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.lineStyle(3, 0xFFA500, 1);
    graphics.strokeRect(0, 0, 80, 80);
    graphics.generateTexture('yellowBox', 80, 80);
    graphics.destroy();
  }

  create() {
    // 添加标题和说明
    this.add.text(400, 30, '拖拽黄色方块排序', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 70, '松手后会按 Y 坐标自动排列', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 排序计数器显示
    this.sortText = this.add.text(400, 550, `排序次数: ${this.sortCount}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建5个黄色方块，初始随机Y坐标
    const startX = 200;
    const spacing = 120;
    const initialYPositions = [150, 300, 450, 250, 380];

    for (let i = 0; i < 5; i++) {
      const box = this.add.sprite(
        startX + i * spacing,
        initialYPositions[i],
        'yellowBox'
      );

      // 添加编号文本
      const label = this.add.text(box.x, box.y, `${i + 1}`, {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 将文本绑定到方块
      box.label = label;
      box.initialX = box.x; // 记录初始X坐标

      // 启用交互和拖拽
      box.setInteractive({ draggable: true });

      this.boxes.push(box);
    }

    // 拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0xFFFFAA); // 高亮显示
      gameObject.setDepth(1); // 置顶
      gameObject.label.setDepth(2);
    });

    // 拖拽中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      // 同步标签位置
      gameObject.label.x = dragX;
      gameObject.label.y = dragY;
    });

    // 拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint(); // 恢复颜色
      gameObject.setDepth(0);
      gameObject.label.setDepth(1);
      
      // 触发自动排序
      this.autoSort();
    });
  }

  autoSort() {
    // 增加排序计数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);

    // 按 Y 坐标排序
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);

    // 计算目标位置（均匀分布在垂直方向）
    const topY = 150;
    const bottomY = 450;
    const spacing = (bottomY - topY) / (this.boxes.length - 1);

    // 使用 Tween 平滑移动到新位置
    sortedBoxes.forEach((box, index) => {
      const targetY = topY + index * spacing;
      const targetX = box.initialX; // 恢复到初始X位置

      // 方块移动动画
      this.tweens.add({
        targets: box,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 实时同步标签位置
          box.label.x = box.x;
          box.label.y = box.y;
        }
      });

      // 标签移动动画（同步）
      this.tweens.add({
        targets: box.label,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });
    });

    // 输出排序结果到控制台（用于验证）
    console.log('排序后顺序:', sortedBoxes.map((box, i) => 
      `方块${this.boxes.indexOf(box) + 1} -> 位置${i + 1}`
    ));
  }

  update(time, delta) {
    // 每帧更新逻辑（当前不需要）
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

// 启动游戏
new Phaser.Game(config);