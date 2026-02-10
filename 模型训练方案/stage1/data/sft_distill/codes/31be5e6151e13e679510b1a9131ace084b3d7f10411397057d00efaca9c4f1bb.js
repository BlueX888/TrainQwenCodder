class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：排序次数
    this.objects = []; // 存储所有可拖拽物体
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 60, 40);
    graphics.generateTexture('greenBox', 60, 40);
    graphics.destroy();

    // 创建标题文本
    this.add.text(400, 30, 'Drag & Drop to Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortText = this.add.text(400, 60, `Sort Count: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建20个绿色物体，随机分布
    for (let i = 0; i < 20; i++) {
      const x = 100 + (i % 5) * 140;
      const y = 150 + Math.floor(i / 5) * 100 + Phaser.Math.Between(-30, 30);
      
      const box = this.add.sprite(x, y, 'greenBox');
      box.setInteractive({ draggable: true });
      
      // 添加序号文本
      const text = this.add.text(x, y, `${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本绑定到物体上
      box.text = text;
      box.originalIndex = i;
      
      this.objects.push(box);
    }

    // 设置拖拽事件
    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时提升层级
      gameObject.setTint(0x88ff88);
      gameObject.setDepth(100);
      gameObject.text.setDepth(101);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // 拖拽中更新位置
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.text.x = dragX;
      gameObject.text.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 拖拽结束时恢复颜色
      gameObject.clearTint();
      gameObject.setDepth(0);
      gameObject.text.setDepth(1);
      
      // 触发排序
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(400, 580, 'Drag any box and release to trigger auto-sort by Y position', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  sortObjects() {
    // 增加排序计数
    this.sortCount++;
    this.sortText.setText(`Sort Count: ${this.sortCount}`);

    // 按Y坐标排序所有物体
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算排列位置（5列4行）
    const startX = 100;
    const startY = 150;
    const spacingX = 140;
    const spacingY = 100;

    sorted.forEach((obj, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);
      const targetX = startX + col * spacingX;
      const targetY = startY + row * spacingY;

      // 使用Tween动画平滑移动到目标位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新文本位置
          obj.text.x = obj.x;
          obj.text.y = obj.y;
        }
      });

      // 文本也需要Tween
      this.tweens.add({
        targets: obj.text,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });
    });

    // 输出排序结果到控制台（用于验证）
    console.log('Sorted order (by original index):', 
      sorted.map(obj => obj.originalIndex + 1).join(', '));
  }

  update(time, delta) {
    // 本示例不需要持续更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene
};

new Phaser.Game(config);