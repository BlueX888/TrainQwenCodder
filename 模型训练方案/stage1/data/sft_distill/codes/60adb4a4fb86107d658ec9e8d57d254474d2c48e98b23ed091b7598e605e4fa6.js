class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = []; // 存储所有可拖拽物体
  }

  preload() {
    // 使用Graphics创建白色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 80, 50);
    graphics.generateTexture('whiteBox', 80, 50);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, '拖拽白色物体，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加状态显示
    this.sortText = this.add.text(400, 60, `排序次数: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建15个白色物体，随机分布
    for (let i = 0; i < 15; i++) {
      const x = 100 + (i % 5) * 120 + Math.random() * 40;
      const y = 150 + Math.floor(i / 5) * 100 + Math.random() * 40;
      
      const box = this.add.sprite(x, y, 'whiteBox');
      box.setInteractive({ draggable: true, cursor: 'pointer' });
      
      // 添加索引文本
      const text = this.add.text(x, y, `${i + 1}`, {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本作为box的属性，方便一起移动
      box.indexText = text;
      box.originalIndex = i;
      
      this.objects.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // 拖拽时更新物体和文本位置
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.indexText.x = dragX;
      gameObject.indexText.y = dragY;
      
      // 拖拽时置于顶层
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.indexText);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 开始拖拽时高亮
      gameObject.setTint(0xcccccc);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 松手后移除高亮
      gameObject.clearTint();
      
      // 触发排序
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(400, 550, '提示: 拖动任意物体后松手，所有物体将按Y坐标重新排列', {
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  sortObjects() {
    // 按当前Y坐标排序
    this.objects.sort((a, b) => a.y - b.y);
    
    // 增加排序计数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);
    
    // 计算新位置并使用Tween动画移动
    const startX = 150;
    const startY = 150;
    const spacing = 30;
    
    this.objects.forEach((obj, index) => {
      const newY = startY + index * spacing;
      const newX = startX + (index % 3) * 200; // 分3列排列
      
      // 使用Tween平滑移动物体
      this.tweens.add({
        targets: obj,
        x: newX,
        y: newY,
        duration: 400,
        ease: 'Power2'
      });
      
      // 同时移动文本
      this.tweens.add({
        targets: obj.indexText,
        x: newX,
        y: newY,
        duration: 400,
        ease: 'Power2'
      });
    });
    
    // 输出排序结果到控制台（用于验证）
    console.log('排序后顺序:', this.objects.map(obj => obj.originalIndex + 1));
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: DragSortScene
};

new Phaser.Game(config);