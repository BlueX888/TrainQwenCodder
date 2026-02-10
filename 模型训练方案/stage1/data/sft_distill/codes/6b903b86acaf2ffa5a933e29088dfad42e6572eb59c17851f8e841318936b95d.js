class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.dragCount = 0;
    this.sortCount = 0;
  }

  preload() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('orangeCircle', 50, 50);
    graphics.destroy();
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      objects: [],
      dragCount: 0,
      sortCount: 0,
      currentPositions: [],
      sortedPositions: []
    };

    // 添加标题文本
    this.add.text(400, 30, '拖拽橙色圆形，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 60, '拖拽次数: 0 | 排序次数: 0', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5).setName('statsText');

    // 创建12个橙色圆形物体
    const startX = 150;
    const startY = 150;
    const spacing = 80;
    const cols = 4;

    for (let i = 0; i < 12; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacing;
      const y = startY + row * spacing;

      const circle = this.add.sprite(x, y, 'orangeCircle');
      circle.setInteractive({ draggable: true });
      circle.setData('index', i);
      circle.setData('originalX', x);
      circle.setData('originalY', y);
      
      // 添加序号文本
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      circle.setData('text', text);
      this.objects.push(circle);

      // 记录初始位置
      window.__signals__.objects.push({
        id: i,
        x: x,
        y: y
      });
    }

    // 设置拖拽事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0xFFD700); // 拖拽时变为金色
      this.children.bringToTop(gameObject);
      const text = gameObject.getData('text');
      this.children.bringToTop(text);
      
      this.dragCount++;
      window.__signals__.dragCount = this.dragCount;
      this.updateStats();
      
      console.log(JSON.stringify({
        event: 'dragstart',
        objectId: gameObject.getData('index'),
        position: { x: gameObject.x, y: gameObject.y }
      }));
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步文本位置
      const text = gameObject.getData('text');
      text.x = dragX;
      text.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint(); // 恢复原色
      
      console.log(JSON.stringify({
        event: 'dragend',
        objectId: gameObject.getData('index'),
        position: { x: gameObject.x, y: gameObject.y }
      }));
      
      // 松手后进行排序
      this.sortObjectsByY();
    });
  }

  sortObjectsByY() {
    this.sortCount++;
    window.__signals__.sortCount = this.sortCount;
    this.updateStats();

    // 记录排序前的位置
    window.__signals__.currentPositions = this.objects.map(obj => ({
      id: obj.getData('index'),
      x: obj.x,
      y: obj.y
    }));

    // 按Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算新位置（垂直排列）
    const startX = 400;
    const startY = 150;
    const verticalSpacing = 35;

    window.__signals__.sortedPositions = [];

    sorted.forEach((obj, index) => {
      const targetY = startY + index * verticalSpacing;
      const targetX = startX;

      window.__signals__.sortedPositions.push({
        id: obj.getData('index'),
        x: targetX,
        y: targetY,
        sortOrder: index
      });

      // 使用缓动动画移动到新位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步文本位置
          const text = obj.getData('text');
          text.x = obj.x;
          text.y = obj.y;
        }
      });

      // 同时移动文本
      const text = obj.getData('text');
      this.tweens.add({
        targets: text,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });
    });

    console.log(JSON.stringify({
      event: 'sort',
      sortCount: this.sortCount,
      sortedOrder: window.__signals__.sortedPositions
    }));
  }

  updateStats() {
    const statsText = this.children.getByName('statsText');
    if (statsText) {
      statsText.setText(`拖拽次数: ${this.dragCount} | 排序次数: ${this.sortCount}`);
    }
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