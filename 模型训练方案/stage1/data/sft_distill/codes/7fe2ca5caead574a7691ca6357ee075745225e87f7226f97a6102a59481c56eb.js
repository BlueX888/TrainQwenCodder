class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.sortCount = 0; // 可验证的状态信号
    this.targetPositions = []; // 目标排列位置
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

    // 创建背景提示文字
    this.add.text(10, 10, 'Drag green boxes to reorder them by Y position', {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.add.text(10, 35, 'Sort Count: 0', {
      fontSize: '14px',
      color: '#ffff00'
    }).setName('sortCountText');

    // 计算目标排列位置（左侧垂直排列）
    const startX = 100;
    const startY = 80;
    const spacing = 50;

    for (let i = 0; i < 20; i++) {
      this.targetPositions.push({
        x: startX,
        y: startY + i * spacing
      });
    }

    // 创建20个绿色物体，随机初始位置
    for (let i = 0; i < 20; i++) {
      const randomX = Phaser.Math.Between(200, 700);
      const randomY = Phaser.Math.Between(80, 550);
      
      const box = this.add.sprite(randomX, randomY, 'greenBox');
      box.setInteractive({ draggable: true });
      box.setData('index', i); // 存储原始索引
      box.setData('originalY', randomY); // 存储初始Y坐标
      
      // 添加边框效果
      const border = this.add.graphics();
      border.lineStyle(2, 0x00aa00, 1);
      border.strokeRect(randomX - 30, randomY - 20, 60, 40);
      box.setData('border', border);
      
      this.objects.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 更新边框位置
      const border = gameObject.getData('border');
      border.clear();
      border.lineStyle(2, 0xffff00, 1); // 拖拽时变黄色
      border.strokeRect(dragX - 30, dragY - 20, 60, 40);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时提升层级
      gameObject.setDepth(100);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复层级
      gameObject.setDepth(0);
      
      // 更新边框颜色
      const border = gameObject.getData('border');
      border.clear();
      border.lineStyle(2, 0x00aa00, 1);
      border.strokeRect(gameObject.x - 30, gameObject.y - 20, 60, 40);
      
      // 执行排序
      this.sortObjects();
    });

    // 初始排序一次
    this.sortObjects();
  }

  sortObjects() {
    // 按Y坐标排序
    this.objects.sort((a, b) => a.y - b.y);
    
    // 增加排序计数
    this.sortCount++;
    const sortText = this.children.getByName('sortCountText');
    if (sortText) {
      sortText.setText(`Sort Count: ${this.sortCount}`);
    }

    // 输出排序结果到控制台（用于验证）
    console.log('Sort #' + this.sortCount + ' - Y positions:', 
      this.objects.map(obj => Math.round(obj.y)));

    // 动画移动到新位置
    this.objects.forEach((obj, index) => {
      const targetPos = this.targetPositions[index];
      const border = obj.getData('border');
      
      // 物体移动动画
      this.tweens.add({
        targets: obj,
        x: targetPos.x,
        y: targetPos.y,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新边框位置
          border.clear();
          border.lineStyle(2, 0x00aa00, 1);
          border.strokeRect(obj.x - 30, obj.y - 20, 60, 40);
        }
      });
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 1000,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

new Phaser.Game(config);