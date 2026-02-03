class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：排序次数
  }

  preload() {
    // 使用Graphics创建紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRect(0, 0, 100, 60);
    graphics.generateTexture('purpleBox', 100, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, '拖拽紫色物体，松手后自动排序', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 70, '排序次数: 0', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建物体数组
    this.boxes = [];
    
    // 创建5个紫色物体，初始位置随机分布
    const startX = 200;
    const spacing = 120;
    
    for (let i = 0; i < 5; i++) {
      const box = this.add.sprite(startX + i * spacing, 200 + Math.random() * 200, 'purpleBox');
      
      // 添加序号文本
      const label = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 创建容器包含物体和文本
      const container = this.add.container(box.x, box.y, [box, label]);
      container.setSize(100, 60);
      
      // 启用交互和拖拽
      container.setInteractive({ draggable: true, cursor: 'pointer' });
      
      // 存储初始数据
      container.setData('index', i);
      container.setData('isDragging', false);
      
      this.boxes.push(container);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.setData('isDragging', true);
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 拖拽时高亮显示
      gameObject.setScale(1.1);
      gameObject.setAlpha(0.8);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时置顶
      this.children.bringToTop(gameObject);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setData('isDragging', false);
      gameObject.setScale(1);
      gameObject.setAlpha(1);
      
      // 松手后执行排序
      this.sortBoxes();
    });

    // 添加说明文本
    this.add.text(400, 550, '提示：拖动物体后松手，将按Y坐标自动排列', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  sortBoxes() {
    // 按当前Y坐标排序
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    
    // 计算目标位置
    const startY = 150;
    const spacing = 80;
    const targetX = 400;
    
    // 为每个物体创建移动动画
    sortedBoxes.forEach((box, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: box,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          // 动画完成后添加轻微弹跳效果
          this.tweens.add({
            targets: box,
            scaleX: 1.05,
            scaleY: 0.95,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeInOut'
          });
        }
      });
    });
    
    // 更新排序次数
    this.sortCount++;
    this.statusText.setText(`排序次数: ${this.sortCount}`);
    
    // 输出状态到控制台用于验证
    console.log(`Sorted ${this.boxes.length} boxes, sort count: ${this.sortCount}`);
  }

  update(time, delta) {
    // 为未拖拽的物体添加轻微浮动效果
    this.boxes.forEach((box, index) => {
      if (!box.getData('isDragging')) {
        const offset = Math.sin(time * 0.001 + index) * 2;
        box.y += offset * 0.01;
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: DragSortScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 启动游戏
const game = new Phaser.Game(config);