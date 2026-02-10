class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.items = [];
    this.sortOrder = [];
  }

  preload() {
    // 创建粉色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 100, 80);
    graphics.generateTexture('pinkBox', 100, 80);
    graphics.destroy();
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      dragCount: 0,
      sortCount: 0,
      currentOrder: [],
      lastSortPositions: []
    };

    // 添加标题文本
    this.add.text(400, 50, 'Drag Pink Boxes to Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加说明文本
    this.add.text(400, 100, 'Drag and release to auto-sort', {
      fontSize: '16px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // 创建3个粉色物体
    const startX = 300;
    const startY = 200;
    const spacing = 120;

    for (let i = 0; i < 3; i++) {
      const item = this.add.sprite(startX, startY + i * spacing, 'pinkBox');
      item.setInteractive({ draggable: true });
      item.setData('id', i);
      item.setData('originalIndex', i);
      
      // 添加序号文本
      const text = this.add.text(0, 0, `Box ${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      item.text = text;
      this.items.push(item);
      
      // 更新文本位置
      text.setPosition(item.x, item.y);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.text.setPosition(dragX, dragY);
      
      window.__signals__.dragCount++;
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0xffaacc); // 拖拽时变浅粉色
      gameObject.setScale(1.1);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint();
      gameObject.setScale(1);
      
      // 拖拽结束后进行排序
      this.sortItems();
    });

    // 初始化排序顺序
    this.updateSortOrder();
  }

  sortItems() {
    // 按Y坐标排序
    const sorted = [...this.items].sort((a, b) => a.y - b.y);
    
    // 记录排序信号
    window.__signals__.sortCount++;
    window.__signals__.currentOrder = sorted.map(item => item.getData('id'));
    
    // 计算新位置（垂直排列，间距120）
    const targetX = 300;
    const startY = 200;
    const spacing = 120;
    const positions = [];

    sorted.forEach((item, index) => {
      const targetY = startY + index * spacing;
      positions.push({ x: targetX, y: targetY });
      
      // 使用 Tween 动画移动到目标位置
      this.tweens.add({
        targets: item,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新文本位置
          item.text.setPosition(item.x, item.y);
        }
      });

      // 移动文本
      this.tweens.add({
        targets: item.text,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });

    window.__signals__.lastSortPositions = positions;
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'sort',
      sortCount: window.__signals__.sortCount,
      order: window.__signals__.currentOrder,
      positions: positions
    }));
  }

  updateSortOrder() {
    const sorted = [...this.items].sort((a, b) => a.y - b.y);
    window.__signals__.currentOrder = sorted.map(item => item.getData('id'));
  }

  update(time, delta) {
    // 实时显示状态信息
    if (!this.statusText) {
      this.statusText = this.add.text(400, 550, '', {
        fontSize: '14px',
        color: '#ffff00',
        align: 'center'
      }).setOrigin(0.5);
    }

    this.statusText.setText(
      `Drags: ${window.__signals__.dragCount} | ` +
      `Sorts: ${window.__signals__.sortCount} | ` +
      `Order: [${window.__signals__.currentOrder.join(', ')}]`
    );
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