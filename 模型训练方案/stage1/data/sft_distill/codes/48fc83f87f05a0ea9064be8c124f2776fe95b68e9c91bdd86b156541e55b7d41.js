class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.sortOrder = []; // 可验证的状态信号：当前排序顺序
  }

  preload() {
    // 使用Graphics创建灰色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 100, 60);
    graphics.generateTexture('grayBox', 100, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文字
    this.add.text(400, 30, '拖拽灰色物体，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加排序信息文字
    this.sortText = this.add.text(400, 560, '', {
      fontSize: '16px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 创建10个灰色物体，随机分布
    for (let i = 0; i < 10; i++) {
      const x = 150 + (i % 5) * 120;
      const y = 150 + Math.floor(i / 5) * 150 + Math.random() * 80;
      
      const obj = this.add.sprite(x, y, 'grayBox');
      obj.setInteractive({ draggable: true });
      obj.id = i; // 给每个物体一个ID
      
      // 添加物体编号文字
      const text = this.add.text(x, y, `#${i}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      obj.labelText = text;
      this.objects.push(obj);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0xaaaaaa); // 拖拽时变亮
      gameObject.setDepth(1); // 提升层级
      gameObject.labelText.setDepth(2);
    });

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.labelText.x = dragX;
      gameObject.labelText.y = dragY;
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint(); // 恢复颜色
      gameObject.setDepth(0);
      gameObject.labelText.setDepth(1);
      
      // 松手后执行排序
      this.sortObjects();
    });

    // 初始化排序顺序
    this.updateSortOrder();
  }

  sortObjects() {
    // 按Y坐标排序所有物体
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新位置（垂直排列）
    const startX = 400;
    const startY = 100;
    const spacing = 45;
    
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      // 使用Tween动画平滑移动到新位置
      this.tweens.add({
        targets: [obj, obj.labelText],
        x: startX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          // 所有动画完成后更新排序信息
          if (index === sorted.length - 1) {
            this.updateSortOrder();
          }
        }
      });
    });
  }

  updateSortOrder() {
    // 更新排序顺序状态
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    this.sortOrder = sorted.map(obj => obj.id);
    
    // 显示当前排序
    this.sortText.setText(`当前排序: [${this.sortOrder.join(', ')}]`);
    
    // 输出到控制台供验证
    console.log('Sort Order:', this.sortOrder);
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