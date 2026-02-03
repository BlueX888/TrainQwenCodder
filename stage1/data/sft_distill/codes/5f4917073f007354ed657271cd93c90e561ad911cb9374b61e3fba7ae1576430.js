class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0;      // 拖拽次数
    this.sortCount = 0;      // 排序次数
    this.objects = [];       // 存储所有物体
  }

  preload() {
    // 使用Graphics创建黄色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillRect(0, 0, 80, 60);
    graphics.generateTexture('yellowBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题
    this.add.text(400, 30, 'Drag Yellow Objects to Sort', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 70, '', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 添加说明
    this.add.text(400, 550, 'Drag objects - they will auto-sort by Y position on release', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建10个黄色物体，随机分布在画布上
    for (let i = 0; i < 10; i++) {
      const x = 150 + (i % 5) * 120;
      const y = 150 + Math.floor(i / 5) * 150 + Math.random() * 80;
      
      const obj = this.add.sprite(x, y, 'yellowBox');
      
      // 添加编号文本
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 启用拖拽
      obj.setInteractive({ draggable: true });
      
      // 存储物体信息
      obj.label = label;
      obj.index = i;
      obj.originalDepth = i;
      
      this.objects.push(obj);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // 更新物体位置
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 更新标签位置
      gameObject.label.x = dragX;
      gameObject.label.y = dragY;
      
      // 将拖拽的物体置于顶层
      gameObject.setDepth(100);
      gameObject.label.setDepth(101);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      this.dragCount++;
      this.updateStatus();
      
      // 高亮效果
      gameObject.setTint(0xFFFFAA);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复颜色
      gameObject.clearTint();
      
      // 触发排序
      this.sortObjects();
    });

    // 初始化状态显示
    this.updateStatus();
  }

  sortObjects() {
    this.sortCount++;
    this.updateStatus();

    // 按Y坐标排序所有物体
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算目标位置（垂直排列在画布中央）
    const startY = 120;
    const spacing = 45;
    const centerX = 400;

    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      // 恢复深度
      obj.setDepth(index);
      obj.label.setDepth(index + 1);

      // 使用tween动画移动到新位置
      this.tweens.add({
        targets: obj,
        x: centerX,
        y: targetY,
        duration: 400,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新标签位置
          obj.label.x = obj.x;
          obj.label.y = obj.y;
        }
      });

      // 标签动画
      this.tweens.add({
        targets: obj.label,
        x: centerX,
        y: targetY,
        duration: 400,
        ease: 'Power2'
      });
    });
  }

  updateStatus() {
    this.statusText.setText(
      `Drags: ${this.dragCount} | Sorts: ${this.sortCount}`
    );
  }

  update(time, delta) {
    // 可选：添加悬停效果
    this.objects.forEach(obj => {
      if (obj.input && obj.input.enabled) {
        const pointer = this.input.activePointer;
        const bounds = obj.getBounds();
        
        if (!this.input.getDragState(pointer) && 
            Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
          obj.setScale(1.05);
        } else if (obj.scaleX > 1) {
          obj.setScale(1);
        }
      }
    });
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