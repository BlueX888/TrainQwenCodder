class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = [];
  }

  preload() {
    // 使用Graphics创建红色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 80, 60);
    graphics.generateTexture('redBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 创建标题文本
    this.add.text(400, 30, 'Drag & Drop to Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建状态显示文本
    this.sortText = this.add.text(400, 70, 'Sort Count: 0', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建10个红色物体，初始随机Y位置
    const startX = 360;
    const spacing = 100;
    
    for (let i = 0; i < 10; i++) {
      const randomY = 150 + Math.random() * 350;
      const box = this.add.sprite(startX + (i % 5) * spacing, randomY, 'redBox');
      
      // 添加序号文本
      const label = this.add.text(box.x, box.y, `${i + 1}`, {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本作为子对象绑定到box
      box.label = label;
      
      // 启用交互和拖拽
      box.setInteractive({ draggable: true });
      
      this.objects.push(box);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      // 提升层级到最上层
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.label);
      
      // 放大效果
      this.tweens.add({
        targets: gameObject,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
    });

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 文本跟随
      if (gameObject.label) {
        gameObject.label.x = dragX;
        gameObject.label.y = dragY;
      }
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复大小
      this.tweens.add({
        targets: gameObject,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
      
      // 执行排序
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(400, 560, 'Drag any box and release to auto-sort by Y position', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  sortObjects() {
    // 收集所有物体及其Y坐标
    const objectsData = this.objects.map(obj => ({
      object: obj,
      y: obj.y
    }));

    // 按Y坐标排序
    objectsData.sort((a, b) => a.y - b.y);

    // 计算排列位置（两列布局）
    const leftX = 300;
    const rightX = 500;
    const startY = 150;
    const spacing = 50;

    objectsData.forEach((data, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const targetX = column === 0 ? leftX : rightX;
      const targetY = startY + row * spacing;

      // 使用Tween动画移动到目标位置
      this.tweens.add({
        targets: data.object,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });

      // 同时移动文本
      if (data.object.label) {
        this.tweens.add({
          targets: data.object.label,
          x: targetX,
          y: targetY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    // 更新排序计数
    this.sortCount++;
    this.sortText.setText(`Sort Count: ${this.sortCount}`);

    // 在控制台输出状态信号
    console.log('Sort completed. Total sorts:', this.sortCount);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
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