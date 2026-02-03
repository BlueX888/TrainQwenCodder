class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = [];
    this.startX = 400;
    this.spacing = 120;
  }

  preload() {
    // 使用Graphics创建青色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture('cyanBox', 80, 80);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 50, 'Drag Cyan Boxes - Auto Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加排序次数显示
    this.sortText = this.add.text(400, 100, `Sort Count: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建3个青色物体
    const startY = 300;
    for (let i = 0; i < 3; i++) {
      const box = this.add.image(this.startX, startY + i * this.spacing, 'cyanBox');
      box.setInteractive({ draggable: true });
      box.originalIndex = i;
      
      // 添加标签
      const label = this.add.text(box.x, box.y, `Box ${i + 1}`, {
        fontSize: '16px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      box.label = label;
      this.objects.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      // 同步标签位置
      gameObject.label.x = dragX;
      gameObject.label.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(400, 550, 'Drag boxes and release to auto-sort by Y position', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  sortObjects() {
    // 按Y坐标排序
    this.objects.sort((a, b) => a.y - b.y);
    
    // 更新排序次数
    this.sortCount++;
    this.sortText.setText(`Sort Count: ${this.sortCount}`);

    // 计算新位置并使用补间动画移动
    const startY = 300;
    this.objects.forEach((obj, index) => {
      const targetY = startY + index * this.spacing;
      
      // 如果位置有变化才执行动画
      if (Math.abs(obj.y - targetY) > 1 || Math.abs(obj.x - this.startX) > 1) {
        this.tweens.add({
          targets: obj,
          x: this.startX,
          y: targetY,
          duration: 300,
          ease: 'Power2',
          onUpdate: () => {
            // 同步标签位置
            obj.label.x = obj.x;
            obj.label.y = obj.y;
          }
        });

        // 标签也添加动画
        this.tweens.add({
          targets: obj.label,
          x: this.startX,
          y: targetY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    // 在控制台输出当前排序状态（用于验证）
    console.log('Current order (by Y):', this.objects.map(obj => `Box ${obj.originalIndex + 1}`));
    console.log('Sort count:', this.sortCount);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene
};

const game = new Phaser.Game(config);