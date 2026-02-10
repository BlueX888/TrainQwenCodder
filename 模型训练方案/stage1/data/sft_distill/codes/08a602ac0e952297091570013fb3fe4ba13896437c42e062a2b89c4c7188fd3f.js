class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号
    this.objects = [];
  }

  preload() {
    // 使用Graphics创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('greenCircle', 50, 50);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, '拖拽绿色圆形，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 60, `排序次数: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建15个绿色圆形物体
    const startX = 150;
    const startY = 120;
    const spacing = 40;

    for (let i = 0; i < 15; i++) {
      // 随机分布在画布上
      const x = startX + (i % 5) * 120 + Math.random() * 40;
      const y = startY + Math.floor(i / 5) * 150 + Math.random() * 60;

      const circle = this.add.sprite(x, y, 'greenCircle');
      
      // 添加编号文本
      const text = this.add.text(0, 0, `${i + 1}`, {
        fontSize: '18px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 创建容器包含圆形和文本
      const container = this.add.container(x, y, [circle, text]);
      container.setSize(50, 50);
      container.index = i; // 保存索引用于调试

      // 启用交互和拖拽
      container.setInteractive(
        new Phaser.Geom.Circle(0, 0, 25),
        Phaser.Geom.Circle.Contains
      );
      this.input.setDraggable(container);

      // 添加悬停效果
      container.on('pointerover', () => {
        circle.setTint(0x88ff88);
      });

      container.on('pointerout', () => {
        circle.clearTint();
      });

      this.objects.push(container);
    }

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 拖拽时高亮显示
      gameObject.list[0].setTint(0xffff00);
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复颜色
      gameObject.list[0].clearTint();
      
      // 执行排序
      this.sortObjectsByY();
    });

    // 添加说明文本
    this.add.text(400, 570, '提示：拖动任意圆形后松手，所有物体将按Y坐标自动排列', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  sortObjectsByY() {
    // 增加排序计数
    this.sortCount++;
    this.statusText.setText(`排序次数: ${this.sortCount}`);

    // 按当前Y坐标排序
    const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算新的排列位置（垂直排列，居中显示）
    const startX = 400;
    const startY = 120;
    const verticalSpacing = 30;

    sortedObjects.forEach((obj, index) => {
      const targetY = startY + index * verticalSpacing;

      // 使用Tween动画平滑移动到新位置
      this.tweens.add({
        targets: obj,
        x: startX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          // 动画完成后闪烁一下表示排序完成
          if (index === sortedObjects.length - 1) {
            this.cameras.main.flash(200, 0, 255, 0, false);
          }
        }
      });
    });

    // 输出调试信息
    console.log(`排序完成 #${this.sortCount}:`, 
      sortedObjects.map(obj => `物体${obj.index + 1}(Y:${Math.round(obj.y)})`).join(', ')
    );
  }

  update(time, delta) {
    // 可选：添加呼吸效果
    const scale = 1 + Math.sin(time / 500) * 0.02;
    this.objects.forEach(obj => {
      if (!this.input.getDragState(obj)) {
        obj.setScale(scale);
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
  scene: DragSortScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证函数
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    sortCount: scene.sortCount,
    objectCount: scene.objects.length,
    objectPositions: scene.objects.map((obj, i) => ({
      index: i + 1,
      x: Math.round(obj.x),
      y: Math.round(obj.y)
    }))
  };
};

console.log('游戏已启动！拖拽绿色圆形物体进行排序。');
console.log('使用 getGameState() 查看当前状态。');