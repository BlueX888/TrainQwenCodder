class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortOrder = []; // 可验证的状态信号：记录物体排序顺序
  }

  preload() {
    // 使用Graphics创建紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRoundedRect(0, 0, 120, 80, 10);
    graphics.generateTexture('purpleBox', 120, 80);
    graphics.destroy();
  }

  create() {
    // 添加标题文字
    this.add.text(400, 50, '拖拽紫色物体，松手后自动按Y坐标排序', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建3个可拖拽的紫色物体
    this.boxes = [];
    const startX = 400;
    const startY = 200;
    const spacing = 120;

    for (let i = 0; i < 3; i++) {
      const box = this.add.sprite(startX, startY + i * spacing, 'purpleBox');
      
      // 添加编号文字
      const label = this.add.text(0, 0, `物体 ${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文字作为子对象添加到box
      box.label = label;
      
      // 启用交互和拖拽
      box.setInteractive({ draggable: true, cursor: 'pointer' });
      
      // 存储原始索引
      box.originalIndex = i;
      
      this.boxes.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 更新标签位置
      if (gameObject.label) {
        gameObject.label.setPosition(dragX, dragY);
      }
      
      // 拖拽时高亮显示
      gameObject.setAlpha(0.7);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时置于顶层
      this.children.bringToTop(gameObject);
      if (gameObject.label) {
        this.children.bringToTop(gameObject.label);
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复透明度
      gameObject.setAlpha(1);
      
      // 触发自动排序
      this.autoSort();
    });

    // 初始化排序顺序
    this.updateSortOrder();

    // 显示当前排序状态
    this.sortText = this.add.text(400, 550, '', {
      fontSize: '18px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
    
    this.updateSortText();
  }

  autoSort() {
    // 按Y坐标排序物体
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    
    // 计算目标位置
    const targetX = 400;
    const startY = 200;
    const spacing = 120;
    
    // 使用Tween动画移动到目标位置
    sortedBoxes.forEach((box, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: box,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 更新标签位置
          if (box.label) {
            box.label.setPosition(box.x, box.y);
          }
        },
        onComplete: () => {
          // 排序完成后更新状态
          if (index === sortedBoxes.length - 1) {
            this.updateSortOrder();
            this.updateSortText();
          }
        }
      });
    });
  }

  updateSortOrder() {
    // 更新排序顺序状态（可验证的状态信号）
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    this.sortOrder = sortedBoxes.map(box => box.originalIndex + 1);
  }

  updateSortText() {
    // 显示当前排序状态
    this.sortText.setText(`当前排序: [${this.sortOrder.join(', ')}]`);
    console.log('排序状态:', this.sortOrder);
  }

  update(time, delta) {
    // 实时更新标签位置（确保标签始终跟随物体）
    this.boxes.forEach(box => {
      if (box.label) {
        box.label.setPosition(box.x, box.y);
      }
    });
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: DragSortScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);