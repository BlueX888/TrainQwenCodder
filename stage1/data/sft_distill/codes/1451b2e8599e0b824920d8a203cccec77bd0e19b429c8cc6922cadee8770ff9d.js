class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.boxes = [];
    this.sortCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(0, 0, 60, 60);
    graphics.generateTexture('redBox', 60, 60);
    graphics.destroy();

    // 创建15个红色方块
    const spacing = 80;
    const startX = 100;
    const startY = 100;
    
    for (let i = 0; i < 15; i++) {
      // 随机初始位置
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const box = this.add.image(x, y, 'redBox');
      box.setInteractive({ draggable: true });
      box.setData('index', i);
      
      // 添加编号文本
      const text = this.add.text(0, 0, (i + 1).toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 将文本添加到容器中以便一起移动
      const container = this.add.container(x, y, [box, text]);
      container.setSize(60, 60);
      container.setInteractive({ draggable: true });
      
      this.boxes.push(container);
      
      // 设置拖拽事件
      container.on('drag', (pointer, dragX, dragY) => {
        container.x = dragX;
        container.y = dragY;
      });
      
      container.on('dragend', () => {
        this.sortBoxes();
      });
    }

    // 添加说明文本
    this.add.text(400, 30, '拖拽红色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortCountText = this.add.text(400, 560, `排序次数: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);
  }

  sortBoxes() {
    // 按Y坐标排序
    this.boxes.sort((a, b) => a.y - b.y);
    
    // 增加排序计数
    this.sortCount++;
    this.sortCountText.setText(`排序次数: ${this.sortCount}`);
    
    // 计算排列位置
    const startX = 400;
    const startY = 100;
    const spacing = 30;
    
    // 使用补间动画移动到新位置
    this.boxes.forEach((box, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: box,
        x: startX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 更新拖拽区域
          box.setPosition(box.x, box.y);
        }
      });
    });
    
    // 输出排序结果到控制台（用于验证）
    console.log('排序后的Y坐标:', this.boxes.map(b => Math.round(b.y)));
    console.log('排序次数:', this.sortCount);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
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