class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0; // 可验证状态：拖拽次数
    this.isSorting = false; // 可验证状态：是否正在排序
    this.blocks = [];
  }

  preload() {
    // 使用Graphics创建蓝色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x4169E1, 1); // 蓝色
    graphics.fillRect(0, 0, 60, 60);
    graphics.generateTexture('blueBlock', 60, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, 'Drag Blue Blocks to Sort by Y Position', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 60, 'Drag Count: 0 | Sorting: No', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 创建10个蓝色方块，随机分布
    const startX = 150;
    const spacing = 60;
    
    for (let i = 0; i < 10; i++) {
      const x = startX + (i % 5) * (spacing + 80);
      const y = 150 + Math.floor(i / 5) * 200 + Math.random() * 100;
      
      const block = this.add.sprite(x, y, 'blueBlock').setInteractive();
      
      // 添加序号文本
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本关联到方块
      block.label = text;
      block.originalDepth = i;
      
      // 设置拖拽
      this.input.setDraggable(block);
      
      this.blocks.push(block);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0x00ff00); // 拖拽时变绿
      gameObject.setDepth(100); // 置顶
      this.dragCount++;
      this.updateStatus();
    });

    // 监听拖拽中事件
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
      gameObject.clearTint(); // 恢复颜色
      gameObject.setDepth(gameObject.originalDepth);
      
      // 触发排序
      this.sortBlocksByY();
    });

    // 添加说明文本
    this.add.text(400, 550, 'Drag any block and release to auto-sort all blocks by Y position', {
      fontSize: '14px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);
  }

  sortBlocksByY() {
    if (this.isSorting) return;
    
    this.isSorting = true;
    this.updateStatus();

    // 收集所有方块及其当前Y坐标
    const blockData = this.blocks.map(block => ({
      block: block,
      y: block.y
    }));

    // 按Y坐标排序
    blockData.sort((a, b) => a.y - b.y);

    // 计算新的排列位置（垂直等间距排列）
    const startY = 150;
    const spacing = 40;

    // 使用补间动画移动到新位置
    blockData.forEach((data, index) => {
      const targetY = startY + index * spacing;
      const targetX = 400; // 居中对齐

      // 方块动画
      this.tweens.add({
        targets: data.block,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          if (index === blockData.length - 1) {
            this.isSorting = false;
            this.updateStatus();
          }
        }
      });

      // 文本动画
      if (data.block.label) {
        this.tweens.add({
          targets: data.block.label,
          x: targetX,
          y: targetY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });
  }

  updateStatus() {
    this.statusText.setText(
      `Drag Count: ${this.dragCount} | Sorting: ${this.isSorting ? 'Yes' : 'No'}`
    );
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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