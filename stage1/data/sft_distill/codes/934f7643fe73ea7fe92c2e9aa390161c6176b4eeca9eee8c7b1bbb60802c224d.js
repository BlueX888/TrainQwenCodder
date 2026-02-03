class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.sortCount = 0; // 可验证的状态信号
    this.isDragging = false;
  }

  preload() {
    // 使用Graphics创建绿色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRoundedRect(0, 0, 80, 60, 8);
    graphics.lineStyle(3, 0x00aa00, 1);
    graphics.strokeRoundedRect(0, 0, 80, 60, 8);
    graphics.generateTexture('greenBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, 'Drag & Drop to Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 60, 'Sort Count: 0', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建15个绿色物体，随机分布
    const startY = 120;
    const spacing = 35;
    
    for (let i = 0; i < 15; i++) {
      // 随机初始位置
      const x = 100 + Math.random() * 600;
      const y = startY + Math.random() * 400;
      
      const obj = this.add.sprite(x, y, 'greenBox');
      
      // 添加编号文本
      const label = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 创建容器
      const container = this.add.container(x, y, [obj, label]);
      container.setSize(80, 60);
      container.index = i;
      
      // 启用交互和拖拽
      container.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 80, 60),
        Phaser.Geom.Rectangle.Contains
      );
      this.input.setDraggable(container);
      
      // 添加悬停效果
      container.on('pointerover', () => {
        if (!this.isDragging) {
          obj.setTint(0x88ff88);
        }
      });
      
      container.on('pointerout', () => {
        obj.clearTint();
      });
      
      this.objects.push(container);
    }

    // 设置拖拽事件
    this.input.on('dragstart', (pointer, gameObject) => {
      this.isDragging = true;
      gameObject.setDepth(1000);
      // 拖拽时高亮
      gameObject.list[0].setTint(0xffff00);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.isDragging = false;
      gameObject.setDepth(0);
      gameObject.list[0].clearTint();
      
      // 松手后执行排序
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(400, 580, 'Drag any box and release to auto-sort all boxes by Y position', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  sortObjects() {
    // 增加排序计数
    this.sortCount++;
    this.statusText.setText(`Sort Count: ${this.sortCount}`);
    
    // 按当前Y坐标排序
    const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新的排列位置
    const startX = 400;
    const startY = 120;
    const spacing = 30;
    
    // 动画移动到新位置
    sortedObjects.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      // 如果物体不在目标位置，则创建移动动画
      if (Math.abs(obj.x - startX) > 1 || Math.abs(obj.y - targetY) > 1) {
        this.tweens.add({
          targets: obj,
          x: startX,
          y: targetY,
          duration: 400,
          ease: 'Power2',
          onStart: () => {
            // 动画开始时添加缩放效果
            this.tweens.add({
              targets: obj,
              scaleX: 1.1,
              scaleY: 1.1,
              duration: 200,
              yoyo: true,
              ease: 'Sine.easeInOut'
            });
          }
        });
      }
    });
    
    // 添加排序完成的视觉反馈
    this.cameras.main.flash(200, 0, 255, 0, false, (camera, progress) => {
      if (progress === 1) {
        console.log(`Sort completed! Total sorts: ${this.sortCount}`);
      }
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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

// 导出状态用于验证
window.getGameState = () => {
  const scene = game.scene.scenes[0];
  return {
    sortCount: scene.sortCount,
    objectCount: scene.objects.length,
    objectPositions: scene.objects.map(obj => ({ x: obj.x, y: obj.y }))
  };
};