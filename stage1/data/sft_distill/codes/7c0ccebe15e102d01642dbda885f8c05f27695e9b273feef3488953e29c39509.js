class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 验证状态：记录排序次数
  }

  preload() {
    // 创建青色矩形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, 100, 80);
    graphics.generateTexture('cyanBox', 100, 80);
    graphics.destroy();
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '拖拽青色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortText = this.add.text(400, 100, `排序次数: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建3个可拖拽的青色物体
    this.boxes = [];
    const startX = 400;
    const startYPositions = [200, 350, 500];

    for (let i = 0; i < 3; i++) {
      const box = this.add.sprite(startX, startYPositions[i], 'cyanBox');
      box.setInteractive({ draggable: true });
      box.name = `Box${i + 1}`; // 给每个物体命名
      
      // 添加标签文本
      const label = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      box.label = label;
      this.boxes.push(box);
      
      // 更新标签位置
      this.updateLabelPosition(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      this.updateLabelPosition(gameObject);
    });

    // 拖拽结束事件 - 执行排序
    this.input.on('dragend', (pointer, gameObject) => {
      this.sortBoxesByY();
    });

    // 添加说明文本
    this.add.text(400, 550, '提示：拖动方块改变位置，松手后会自动排序', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  updateLabelPosition(box) {
    // 更新标签位置，使其始终在物体中心
    if (box.label) {
      box.label.setPosition(box.x, box.y);
    }
  }

  sortBoxesByY() {
    // 收集所有物体的Y坐标并排序
    const yPositions = this.boxes.map(box => box.y).sort((a, b) => a - b);
    
    // 按当前Y坐标排序物体
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    
    // 为每个物体分配新的Y坐标（保持排序后的位置）
    sortedBoxes.forEach((box, index) => {
      const targetY = yPositions[index];
      
      // 只在位置需要改变时才执行动画
      if (Math.abs(box.y - targetY) > 1) {
        // 使用Tween平滑移动到目标位置
        this.tweens.add({
          targets: box,
          y: targetY,
          duration: 300,
          ease: 'Power2',
          onUpdate: () => {
            this.updateLabelPosition(box);
          }
        });
      }
    });

    // 更新排序计数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);
    
    // 在控制台输出验证信息
    console.log(`排序完成 #${this.sortCount}`, 
      sortedBoxes.map(box => ({ name: box.name, y: Math.round(box.y) }))
    );
  }

  update(time, delta) {
    // 持续更新标签位置（确保在任何情况下都保持同步）
    this.boxes.forEach(box => {
      if (box.label) {
        this.updateLabelPosition(box);
      }
    });
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene
};

// 创建游戏实例
new Phaser.Game(config);