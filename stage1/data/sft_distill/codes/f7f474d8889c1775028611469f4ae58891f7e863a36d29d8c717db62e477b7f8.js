class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证状态：排序次数
    this.objects = [];
    this.isDragging = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('orangeCircle', 50, 50);
    graphics.destroy();

    // 创建15个可拖拽的橙色物体
    const startX = 100;
    const startY = 100;
    const spacing = 40;

    for (let i = 0; i < 15; i++) {
      const x = startX + (i % 5) * 120;
      const y = startY + Math.floor(i / 5) * 120;
      
      const obj = this.add.image(x, y, 'orangeCircle');
      obj.setInteractive({ draggable: true });
      obj.setData('index', i);
      obj.setData('originalY', y);
      
      // 添加文本标签显示序号
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      obj.setData('text', text);
      
      this.objects.push(obj);
    }

    // 添加标题和说明
    this.add.text(400, 30, '橙色物体拖拽排序', {
      fontSize: '28px',
      color: '#FF8C00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 60, '拖动圆形，松手后自动按Y坐标排序', {
      fontSize: '16px',
      color: '#666666'
    }).setOrigin(0.5);

    // 排序次数显示
    this.sortCountText = this.add.text(400, 550, `排序次数: ${this.sortCount}`, {
      fontSize: '20px',
      color: '#FF8C00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 拖拽事件监听
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      this.isDragging = true;
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步更新文本位置
      const text = gameObject.getData('text');
      if (text) {
        text.x = dragX;
        text.y = dragY;
      }
      
      // 拖拽时高亮显示
      gameObject.setScale(1.2);
      gameObject.setAlpha(0.8);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 将拖拽的物体置于顶层
      this.children.bringToTop(gameObject);
      const text = gameObject.getData('text');
      if (text) {
        this.children.bringToTop(text);
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.isDragging = false;
      
      // 恢复原始大小和透明度
      gameObject.setScale(1);
      gameObject.setAlpha(1);
      
      // 执行排序
      this.sortObjects();
    });

    // 添加重置按钮
    const resetButton = this.add.text(400, 500, '重置位置', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#FF8C00',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    resetButton.on('pointerdown', () => {
      this.resetPositions();
    });

    resetButton.on('pointerover', () => {
      resetButton.setStyle({ backgroundColor: '#FFA500' });
    });

    resetButton.on('pointerout', () => {
      resetButton.setStyle({ backgroundColor: '#FF8C00' });
    });
  }

  sortObjects() {
    // 按Y坐标排序所有物体
    const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算排列位置（3列5行布局）
    const startX = 100;
    const startY = 100;
    const cols = 5;
    const spacingX = 120;
    const spacingY = 120;

    sortedObjects.forEach((obj, index) => {
      const targetX = startX + (index % cols) * spacingX;
      const targetY = startY + Math.floor(index / cols) * spacingY;
      
      // 使用Tween动画平滑移动到目标位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新文本位置
          const text = obj.getData('text');
          if (text) {
            text.x = obj.x;
            text.y = obj.y;
          }
        }
      });

      // 同时移动文本
      const text = obj.getData('text');
      if (text) {
        this.tweens.add({
          targets: text,
          x: targetX,
          y: targetY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    // 增加排序次数
    this.sortCount++;
    this.sortCountText.setText(`排序次数: ${this.sortCount}`);
    
    console.log(`排序完成 - 第${this.sortCount}次排序`);
  }

  resetPositions() {
    // 重置所有物体到初始位置
    const startX = 100;
    const startY = 100;

    this.objects.forEach((obj, i) => {
      const targetX = startX + (i % 5) * 120;
      const targetY = startY + Math.floor(i / 5) * 120;
      
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });

      const text = obj.getData('text');
      if (text) {
        this.tweens.add({
          targets: text,
          x: targetX,
          y: targetY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    console.log('位置已重置');
  }

  update(time, delta) {
    // 每帧更新逻辑（当前场景不需要特殊更新）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#f0f0f0',
  scene: DragSortScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);