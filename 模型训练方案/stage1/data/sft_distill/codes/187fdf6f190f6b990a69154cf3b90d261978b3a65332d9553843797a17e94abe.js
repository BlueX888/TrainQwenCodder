class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('orangeCircle', 50, 50);
    graphics.destroy();

    // 创建15个橙色物体，随机分布
    const startX = 100;
    const spacing = 50;
    
    for (let i = 0; i < 15; i++) {
      const x = startX + (i % 5) * 150 + Phaser.Math.Between(-20, 20);
      const y = 100 + Math.floor(i / 5) * 150 + Phaser.Math.Between(-30, 30);
      
      const obj = this.add.image(x, y, 'orangeCircle');
      obj.setInteractive({ draggable: true });
      obj.setData('index', i); // 存储索引用于调试
      
      this.objects.push(obj);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setScale(1.2); // 拖拽时放大
      gameObject.setDepth(1); // 置于顶层
    });

    // 监听拖拽中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setScale(1); // 恢复原始大小
      gameObject.setDepth(0);
      
      // 执行排序
      this.sortObjectsByY();
    });

    // 添加说明文本
    this.add.text(20, 20, '拖动橙色圆圈，松手后自动按Y坐标排序', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示排序次数
    this.sortText = this.add.text(20, 550, `排序次数: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  sortObjectsByY() {
    // 按Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新的排列位置（垂直排列，左侧对齐）
    const startX = 400;
    const startY = 100;
    const spacing = 30;
    
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      // 使用补间动画平滑移动到新位置
      this.tweens.add({
        targets: obj,
        x: startX,
        y: targetY,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          // 所有动画完成后更新排序计数
          if (index === sorted.length - 1) {
            this.sortCount++;
            this.sortText.setText(`排序次数: ${this.sortCount}`);
            console.log(`第${this.sortCount}次排序完成`);
          }
        }
      });
    });
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
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

new Phaser.Game(config);