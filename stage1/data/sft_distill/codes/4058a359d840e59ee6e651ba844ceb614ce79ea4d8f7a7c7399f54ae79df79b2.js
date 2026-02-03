class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证状态：排序次数
    this.objects = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 添加标题和说明
    this.add.text(width / 2, 30, '拖拽白色方块，松手后自动排序', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加排序计数器显示
    this.sortCountText = this.add.text(width / 2, 60, `排序次数: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.lineStyle(2, 0x666666, 1);
    graphics.strokeRect(0, 0, 60, 60);
    graphics.generateTexture('whiteBox', 60, 60);
    graphics.destroy();

    // 创建15个可拖拽的物体
    const startY = 120;
    const spacing = 80;
    
    for (let i = 0; i < 15; i++) {
      // 随机初始位置
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(startY, height - 80);
      
      const obj = this.add.sprite(x, y, 'whiteBox');
      obj.setInteractive({ draggable: true });
      
      // 添加序号文本
      const text = this.add.text(0, 0, `${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本作为物体的属性存储
      obj.label = text;
      obj.originalIndex = i + 1;
      
      // 更新文本位置
      text.setPosition(obj.x, obj.y);
      
      this.objects.push(obj);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      // 同步更新标签位置
      if (gameObject.label) {
        gameObject.label.setPosition(dragX, dragY);
      }
      // 拖拽时提升层级
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.label);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时放大
      this.tweens.add({
        targets: gameObject,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        ease: 'Power1'
      });
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 拖拽结束时恢复大小
      this.tweens.add({
        targets: gameObject,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power1'
      });
      
      // 执行排序
      this.sortObjects();
    });

    // 添加重置按钮
    const resetBtn = this.add.text(width - 100, 30, '重置', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    resetBtn.on('pointerdown', () => {
      this.resetPositions();
    });

    resetBtn.on('pointerover', () => {
      resetBtn.setStyle({ backgroundColor: '#555555' });
    });

    resetBtn.on('pointerout', () => {
      resetBtn.setStyle({ backgroundColor: '#333333' });
    });
  }

  sortObjects() {
    // 按Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新的位置
    const width = this.cameras.main.width;
    const startY = 150;
    const spacing = 40;
    const centerX = width / 2;
    
    // 动画移动到新位置
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: obj,
        x: centerX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新标签位置
          if (obj.label) {
            obj.label.setPosition(obj.x, obj.y);
          }
        }
      });
    });
    
    // 增加排序计数
    this.sortCount++;
    this.sortCountText.setText(`排序次数: ${this.sortCount}`);
  }

  resetPositions() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const startY = 120;
    
    // 随机重新分布所有物体
    this.objects.forEach((obj) => {
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(startY, height - 80);
      
      this.tweens.add({
        targets: obj,
        x: x,
        y: y,
        duration: 400,
        ease: 'Back.easeOut',
        onUpdate: () => {
          if (obj.label) {
            obj.label.setPosition(obj.x, obj.y);
          }
        }
      });
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#222222',
  scene: DragSortScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);