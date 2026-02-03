class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.dragCount = 0;
    this.sortCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      objectCount: 20,
      dragCount: 0,
      sortCount: 0,
      objects: [],
      lastSort: null
    };

    // 创建标题文字
    this.add.text(400, 30, '拖拽黄色物体，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 60, '拖拽次数: 0 | 排序次数: 0', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5).setName('statsText');

    // 创建20个黄色矩形物体
    const startX = 100;
    const startY = 120;
    const spacing = 25;
    const objectWidth = 60;
    const objectHeight = 20;

    for (let i = 0; i < 20; i++) {
      // 使用Graphics创建黄色矩形纹理
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffff00, 1);
      graphics.fillRect(0, 0, objectWidth, objectHeight);
      graphics.lineStyle(2, 0x000000, 1);
      graphics.strokeRect(0, 0, objectWidth, objectHeight);
      graphics.generateTexture(`yellowBox${i}`, objectWidth, objectHeight);
      graphics.destroy();

      // 创建可拖拽的精灵
      const x = startX + (i % 10) * 70;
      const y = startY + Math.floor(i / 10) * spacing;
      const obj = this.add.sprite(x, y, `yellowBox${i}`);
      
      // 添加编号文字
      const text = this.add.text(x, y, `${i + 1}`, {
        fontSize: '12px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 设置为可交互和可拖拽
      obj.setInteractive({ draggable: true });
      obj.setData('id', i);
      obj.setData('text', text);
      obj.setData('originalIndex', i);

      this.objects.push(obj);

      // 更新signals
      window.__signals__.objects.push({
        id: i,
        x: x,
        y: y
      });
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 更新关联的文字位置
      const text = gameObject.getData('text');
      if (text) {
        text.x = dragX;
        text.y = dragY;
      }
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时提升深度
      gameObject.setDepth(100);
      const text = gameObject.getData('text');
      if (text) {
        text.setDepth(101);
      }

      this.dragCount++;
      window.__signals__.dragCount = this.dragCount;
      this.updateStatsText();

      console.log(JSON.stringify({
        event: 'dragstart',
        objectId: gameObject.getData('id'),
        position: { x: gameObject.x, y: gameObject.y }
      }));
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复深度
      gameObject.setDepth(0);
      const text = gameObject.getData('text');
      if (text) {
        text.setDepth(1);
      }

      console.log(JSON.stringify({
        event: 'dragend',
        objectId: gameObject.getData('id'),
        position: { x: gameObject.x, y: gameObject.y }
      }));

      // 执行排序
      this.sortObjectsByY();
    });
  }

  sortObjectsByY() {
    // 按Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算新的Y位置（等间距排列）
    const startY = 120;
    const spacing = 25;

    this.sortCount++;
    window.__signals__.sortCount = this.sortCount;
    window.__signals__.lastSort = new Date().toISOString();

    const sortedPositions = [];

    sorted.forEach((obj, index) => {
      const newY = startY + index * spacing;
      const currentX = obj.x;

      sortedPositions.push({
        id: obj.getData('id'),
        oldY: obj.y,
        newY: newY,
        index: index
      });

      // 使用缓动动画移动到新位置
      this.tweens.add({
        targets: obj,
        y: newY,
        duration: 300,
        ease: 'Power2'
      });

      // 同时移动关联的文字
      const text = obj.getData('text');
      if (text) {
        this.tweens.add({
          targets: text,
          y: newY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    // 更新signals
    window.__signals__.objects = this.objects.map(obj => ({
      id: obj.getData('id'),
      x: obj.x,
      y: obj.y
    }));

    this.updateStatsText();

    console.log(JSON.stringify({
      event: 'sort',
      sortCount: this.sortCount,
      positions: sortedPositions
    }));
  }

  updateStatsText() {
    const statsText = this.children.getByName('statsText');
    if (statsText) {
      statsText.setText(`拖拽次数: ${this.dragCount} | 排序次数: ${this.sortCount}`);
    }
  }

  update(time, delta) {
    // 每帧更新signals中的当前位置
    window.__signals__.objects = this.objects.map(obj => ({
      id: obj.getData('id'),
      x: Math.round(obj.x),
      y: Math.round(obj.y)
    }));
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