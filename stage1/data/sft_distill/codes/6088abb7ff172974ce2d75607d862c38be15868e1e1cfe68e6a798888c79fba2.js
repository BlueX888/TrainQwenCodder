class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = [];
  }

  preload() {
    // 使用Graphics创建紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9966ff, 1);
    graphics.fillRect(0, 0, 80, 50);
    graphics.generateTexture('purpleBox', 80, 50);
    graphics.destroy();
  }

  create() {
    // 添加标题文字
    this.add.text(400, 30, '拖拽紫色物体，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加状态显示
    this.sortText = this.add.text(400, 60, `排序次数: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建15个紫色物体
    const startX = 100;
    const startY = 120;
    const spacing = 35;

    for (let i = 0; i < 15; i++) {
      // 随机分布在不同位置
      const x = startX + (i % 5) * 140;
      const y = startY + Math.floor(i / 5) * 140;
      
      const obj = this.add.sprite(x, y, 'purpleBox');
      obj.setInteractive({ draggable: true });
      obj.setData('index', i); // 保存初始索引
      
      // 添加编号文字
      const text = this.add.text(x, y, `${i + 1}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      obj.setData('text', text);
      this.objects.push(obj);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0xff99ff); // 高亮显示
      gameObject.setDepth(100); // 提升层级
      const text = gameObject.getData('text');
      if (text) {
        text.setDepth(101);
      }
    });

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步文字位置
      const text = gameObject.getData('text');
      if (text) {
        text.x = dragX;
        text.y = dragY;
      }
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint();
      gameObject.setDepth(0);
      const text = gameObject.getData('text');
      if (text) {
        text.setDepth(1);
      }
      
      // 执行排序
      this.sortObjectsByY();
    });

    // 添加说明文字
    this.add.text(400, 570, '提示: 拖动物体后松手，所有物体会按Y坐标重新排列', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  sortObjectsByY() {
    // 增加排序计数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);

    // 按当前Y坐标排序
    const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算新的排列位置（垂直居中排列）
    const startX = 400;
    const startY = 150;
    const verticalSpacing = 25;

    sortedObjects.forEach((obj, index) => {
      const targetX = startX;
      const targetY = startY + index * verticalSpacing;
      
      // 使用缓动动画移动到新位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Power2',
        onUpdate: () => {
          // 同步文字位置
          const text = obj.getData('text');
          if (text) {
            text.x = obj.x;
            text.y = obj.y;
          }
        }
      });

      // 同时移动文字
      const text = obj.getData('text');
      if (text) {
        this.tweens.add({
          targets: text,
          x: targetX,
          y: targetY,
          duration: 400,
          ease: 'Power2'
        });
      }
    });

    // 输出排序结果到控制台（用于验证）
    console.log('排序后顺序:', sortedObjects.map(obj => obj.getData('index') + 1));
  }

  update(time, delta) {
    // 可选：添加帧更新逻辑
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

new Phaser.Game(config);