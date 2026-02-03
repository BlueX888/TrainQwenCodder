class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0; // 可验证的状态信号：拖拽次数
    this.sortedCorrectly = false; // 可验证的状态信号：是否完全排序
    this.boxes = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.generateTexture('redBox', 60, 60);
    graphics.destroy();

    // 创建标题文本
    this.add.text(400, 30, '拖拽红色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 状态显示文本
    this.statusText = this.add.text(400, 60, '', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建10个红色方块
    const startX = 150;
    const startY = 150;
    const spacing = 70;

    for (let i = 0; i < 10; i++) {
      const x = startX + (i % 5) * spacing;
      const y = startY + Math.floor(i / 5) * spacing;
      
      const box = this.add.image(x, y, 'redBox');
      box.setInteractive({ draggable: true });
      box.setData('id', i); // 存储ID用于识别
      box.setData('originalY', y); // 存储初始Y坐标
      
      // 添加编号文本
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      box.setData('text', text); // 关联文本对象
      this.boxes.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步移动文本
      const text = gameObject.getData('text');
      text.x = dragX;
      text.y = dragY;
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时放大并提升深度
      gameObject.setScale(1.1);
      gameObject.setDepth(100);
      const text = gameObject.getData('text');
      text.setDepth(101);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 拖拽结束时恢复缩放
      gameObject.setScale(1);
      gameObject.setDepth(0);
      const text = gameObject.getData('text');
      text.setDepth(1);
      
      // 增加拖拽计数
      this.dragCount++;
      
      // 执行排序
      this.sortBoxes();
    });

    // 初始化状态显示
    this.updateStatus();
  }

  sortBoxes() {
    // 按Y坐标排序方块
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    
    // 计算新的排列位置（垂直排列在画面中央）
    const centerX = 400;
    const startY = 120;
    const spacing = 50;

    sortedBoxes.forEach((box, index) => {
      const targetY = startY + index * spacing;
      const text = box.getData('text');
      
      // 使用补间动画平滑移动
      this.tweens.add({
        targets: box,
        x: centerX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });

      this.tweens.add({
        targets: text,
        x: centerX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });
    });

    // 检查是否完全排序（从上到下Y坐标递增）
    this.checkSortStatus();
    this.updateStatus();
  }

  checkSortStatus() {
    let isSorted = true;
    for (let i = 0; i < this.boxes.length - 1; i++) {
      if (this.boxes[i].y > this.boxes[i + 1].y) {
        isSorted = false;
        break;
      }
    }
    this.sortedCorrectly = isSorted;
  }

  updateStatus() {
    const sortStatus = this.sortedCorrectly ? '已完全排序' : '未完全排序';
    this.statusText.setText(
      `拖拽次数: ${this.dragCount} | 状态: ${sortStatus}`
    );
  }

  update(time, delta) {
    // 实时检查排序状态
    this.checkSortStatus();
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