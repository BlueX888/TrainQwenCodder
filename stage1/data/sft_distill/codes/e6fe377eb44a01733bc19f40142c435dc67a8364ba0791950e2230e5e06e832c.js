class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：排序次数
    this.objects = [];
    this.targetX = 400; // 物体排列的X坐标
    this.spacing = 70; // 物体之间的间距
  }

  preload() {
    // 创建白色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(0, 0, 60, 50, 8);
    graphics.generateTexture('whiteBox', 60, 50);
    graphics.destroy();
  }

  create() {
    // 添加背景色便于观察
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 添加标题文本
    this.add.text(400, 30, 'Drag & Drop to Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加排序次数显示
    this.sortText = this.add.text(400, 560, `Sort Count: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建8个白色物体，随机初始位置
    for (let i = 0; i < 8; i++) {
      const x = this.targetX;
      const y = 100 + i * this.spacing;
      
      const obj = this.add.sprite(x, y, 'whiteBox');
      
      // 添加编号文本
      const label = this.add.text(0, 0, `${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 创建容器组合物体和文本
      const container = this.add.container(x, y, [obj, label]);
      container.setSize(60, 50);
      
      // 启用交互和拖拽
      container.setInteractive({ draggable: true, cursor: 'pointer' });
      
      // 存储原始索引
      container.setData('index', i);
      
      this.objects.push(container);
    }

    // 随机打乱初始位置
    this.shufflePositions();

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 拖拽时高亮显示
      gameObject.list[0].setTint(0xffff00);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时提升层级
      this.children.bringToTop(gameObject);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 取消高亮
      gameObject.list[0].clearTint();
      
      // 触发排序
      this.sortObjects();
    });

    // 添加提示文本
    this.add.text(400, 90, '↓ Drag items to reorder ↓', {
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  shufflePositions() {
    // 随机打乱Y坐标
    const positions = [];
    for (let i = 0; i < 8; i++) {
      positions.push(100 + i * this.spacing);
    }
    
    // Fisher-Yates 洗牌算法
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // 应用随机位置
    this.objects.forEach((obj, index) => {
      obj.y = positions[index];
    });
  }

  sortObjects() {
    // 按Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算目标位置并执行动画
    sorted.forEach((obj, index) => {
      const targetY = 100 + index * this.spacing;
      
      // 使用缓动动画移动到目标位置
      this.tweens.add({
        targets: obj,
        x: this.targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          // 所有动画完成后更新排序计数
          if (index === sorted.length - 1) {
            this.sortCount++;
            this.sortText.setText(`Sort Count: ${this.sortCount}`);
            
            // 显示排序完成提示
            this.showSortComplete();
          }
        }
      });
    });
  }

  showSortComplete() {
    // 创建临时提示文本
    const completeText = this.add.text(400, 300, '✓ Sorted!', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);
    
    // 淡入淡出动画
    this.tweens.add({
      targets: completeText,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 500,
      onComplete: () => {
        completeText.destroy();
      }
    });
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