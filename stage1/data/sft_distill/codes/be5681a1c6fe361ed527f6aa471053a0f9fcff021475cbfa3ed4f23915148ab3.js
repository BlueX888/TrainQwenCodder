class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0; // 状态信号：拖拽次数
    this.sortedCount = 0; // 状态信号：排序次数
    this.objects = [];
  }

  preload() {
    // 使用 Graphics 创建紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9B59B6, 1); // 紫色
    graphics.fillRect(0, 0, 60, 60);
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.strokeRect(0, 0, 60, 60);
    graphics.generateTexture('purpleBox', 60, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题
    this.add.text(400, 30, '拖拽紫色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 60, '拖拽次数: 0 | 排序次数: 0', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建15个紫色物体
    const startX = 100;
    const startY = 120;
    const spacing = 50;

    for (let i = 0; i < 15; i++) {
      // 随机位置分布
      const x = startX + (i % 5) * 140;
      const y = startY + Math.floor(i / 5) * 140;
      
      const obj = this.add.sprite(x, y, 'purpleBox');
      obj.setInteractive({ draggable: true });
      
      // 添加编号文本
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本作为物体的子对象
      obj.labelText = text;
      obj.initialIndex = i;
      
      this.objects.push(obj);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步更新文本位置
      if (gameObject.labelText) {
        gameObject.labelText.x = dragX;
        gameObject.labelText.y = dragY;
      }
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时提升深度
      gameObject.setDepth(1);
      if (gameObject.labelText) {
        gameObject.labelText.setDepth(2);
      }
      
      // 增加拖拽计数
      this.dragCount++;
      this.updateStatus();
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复深度
      gameObject.setDepth(0);
      if (gameObject.labelText) {
        gameObject.labelText.setDepth(1);
      }
      
      // 松手后执行排序
      this.sortObjectsByY();
    });

    // 添加提示文本
    this.add.text(400, 550, '提示：拖动任意方块后松手，所有方块将按Y坐标排序', {
      fontSize: '14px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  sortObjectsByY() {
    // 收集所有物体及其当前Y坐标
    const objectsData = this.objects.map(obj => ({
      obj: obj,
      y: obj.y,
      x: obj.x
    }));

    // 按Y坐标排序
    objectsData.sort((a, b) => a.y - b.y);

    // 计算新的排列位置（垂直排列，居中）
    const startX = 400;
    const startY = 120;
    const verticalSpacing = 30;

    // 为每个物体分配新位置并执行动画
    objectsData.forEach((data, index) => {
      const newY = startY + index * verticalSpacing;
      const newX = startX;

      // 使用补间动画移动到新位置
      this.tweens.add({
        targets: data.obj,
        x: newX,
        y: newY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新文本位置
          if (data.obj.labelText) {
            data.obj.labelText.x = data.obj.x;
            data.obj.labelText.y = data.obj.y;
          }
        }
      });

      // 同时为文本添加动画
      if (data.obj.labelText) {
        this.tweens.add({
          targets: data.obj.labelText,
          x: newX,
          y: newY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    // 增加排序计数
    this.sortedCount++;
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText(`拖拽次数: ${this.dragCount} | 排序次数: ${this.sortedCount}`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: DragSortScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);