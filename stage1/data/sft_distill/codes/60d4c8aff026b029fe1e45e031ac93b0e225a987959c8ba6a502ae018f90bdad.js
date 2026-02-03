class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 验证信号：记录排序次数
    this.objects = []; // 存储所有可拖拽物体
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRoundedRect(0, 0, 100, 80, 10);
    graphics.lineStyle(3, 0x00AAAA, 1);
    graphics.strokeRoundedRect(0, 0, 100, 80, 10);
    graphics.generateTexture('cyanBox', 100, 80);
    graphics.destroy();

    // 创建5个可拖拽物体
    const startX = 150;
    const spacing = 120;
    const startY = 300;

    for (let i = 0; i < 5; i++) {
      const obj = this.add.image(startX + i * spacing, startY, 'cyanBox');
      obj.setInteractive({ draggable: true, useHandCursor: true });
      
      // 添加编号文本
      const text = this.add.text(0, 0, `${i + 1}`, {
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#004444'
      });
      text.setOrigin(0.5);
      
      // 创建容器组合图像和文本
      const container = this.add.container(startX + i * spacing, startY);
      container.add([obj, text]);
      container.setSize(100, 80);
      container.setInteractive({ draggable: true, useHandCursor: true });
      
      // 存储原始位置和索引
      container.originalX = container.x;
      container.index = i;
      
      this.objects.push(container);
    }

    // 拖拽事件处理
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.setDepth(1); // 拖拽时置于顶层
    });

    // 拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setDepth(0);
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(400, 50, '拖拽青色方块，松手后自动按Y坐标排序', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortText = this.add.text(400, 550, `排序次数: ${this.sortCount}`, {
      fontSize: '20px',
      color: '#00FFFF'
    }).setOrigin(0.5);
  }

  sortObjects() {
    // 按Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新的X位置（保持水平排列）
    const startX = 150;
    const spacing = 120;
    const targetY = 300; // 统一的Y坐标

    // 使用Tween动画移动到新位置
    sorted.forEach((obj, index) => {
      const targetX = startX + index * spacing;
      
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          obj.originalX = targetX;
        }
      });
    });

    // 更新排序次数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);
    
    // 在控制台输出排序信息（用于验证）
    console.log('Sort #' + this.sortCount + ':', sorted.map(o => `Object ${o.index + 1}`).join(', '));
  }

  update(time, delta) {
    // 可选：添加悬停效果
    this.objects.forEach(obj => {
      if (obj.input && obj.input.enabled) {
        const isOver = this.input.hitTestPointer(this.input.activePointer).includes(obj);
        if (isOver && !this.input.activePointer.isDown) {
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

// 验证信号访问接口
window.getGameState = () => ({
  sortCount: game.scene.scenes[0].sortCount,
  objectCount: game.scene.scenes[0].objects.length
});