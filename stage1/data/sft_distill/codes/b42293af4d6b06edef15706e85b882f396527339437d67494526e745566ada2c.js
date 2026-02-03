class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号
    this.items = [];
    this.baseX = 400; // 排列的基准X坐标
    this.spacing = 70; // 物体之间的垂直间距
  }

  preload() {
    // 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFD700, 1); // 金黄色
    graphics.fillRoundedRect(0, 0, 60, 60, 8);
    graphics.lineStyle(3, 0xFFA500, 1); // 橙色边框
    graphics.strokeRoundedRect(0, 0, 60, 60, 8);
    graphics.generateTexture('yellowBox', 60, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, '拖拽黄色方块，松手后自动按Y坐标排序', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 70, `排序次数: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建8个黄色物体，初始随机分布
    for (let i = 0; i < 8; i++) {
      const x = this.baseX;
      const y = 150 + i * this.spacing;
      
      const item = this.add.sprite(x, y, 'yellowBox');
      
      // 添加序号文本
      const text = this.add.text(0, 0, `${i + 1}`, {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本作为子对象添加到sprite
      item.text = text;
      item.index = i; // 保存原始索引
      
      // 启用交互和拖拽
      item.setInteractive({ draggable: true, cursor: 'pointer' });
      
      this.items.push(item);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      // 同步更新文本位置
      gameObject.text.setPosition(dragX, dragY);
      
      // 拖拽时高亮显示
      gameObject.setTint(0xFFFFAA);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时置顶
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.text);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 取消高亮
      gameObject.clearTint();
      
      // 触发自动排序
      this.autoSort();
    });

    // 添加提示文本
    this.add.text(400, 580, '提示: 拖动方块到不同位置，松手后会自动排序', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  autoSort() {
    // 按Y坐标排序物体数组
    this.items.sort((a, b) => a.y - b.y);
    
    // 更新排序计数
    this.sortCount++;
    this.statusText.setText(`排序次数: ${this.sortCount}`);
    
    // 使用动画将物体移动到排序后的位置
    this.items.forEach((item, index) => {
      const targetY = 150 + index * this.spacing;
      
      // 物体动画
      this.tweens.add({
        targets: item,
        x: this.baseX,
        y: targetY,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      // 文本动画（同步）
      this.tweens.add({
        targets: item.text,
        x: this.baseX,
        y: targetY,
        duration: 300,
        ease: 'Back.easeOut'
      });
    });
    
    // 输出排序结果到控制台（便于验证）
    console.log('排序后顺序:', this.items.map(item => `物体${item.index + 1}`).join(', '));
    console.log('排序次数:', this.sortCount);
  }

  update() {
    // 实时更新所有文本位置（确保拖拽时文本跟随）
    this.items.forEach(item => {
      if (item.text) {
        item.text.setPosition(item.x, item.y);
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

// 启动游戏
new Phaser.Game(config);