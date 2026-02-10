class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0;      // 拖拽次数
    this.sortCount = 0;      // 排序次数
    this.objects = [];       // 所有可拖拽物体
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932CC, 1); // 紫色
    graphics.fillRect(0, 0, 60, 60);
    graphics.lineStyle(3, 0xFFFFFF, 1);
    graphics.strokeRect(0, 0, 60, 60);
    graphics.generateTexture('purpleBox', 60, 60);
    graphics.destroy();

    // 创建20个可拖拽物体，随机分布
    const startX = 100;
    const startY = 100;
    const columns = 4;
    const spacing = 80;

    for (let i = 0; i < 20; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      
      // 添加随机偏移
      const x = startX + col * spacing + Phaser.Math.Between(-20, 20);
      const y = startY + row * spacing + Phaser.Math.Between(-20, 20);
      
      const box = this.add.sprite(x, y, 'purpleBox');
      box.setInteractive({ draggable: true });
      box.setData('index', i); // 存储索引用于调试
      
      // 添加编号文本
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#FFFFFF'
      });
      text.setOrigin(0.5);
      box.setData('text', text);
      
      this.objects.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 更新文本位置
      const text = gameObject.getData('text');
      if (text) {
        text.x = dragX;
        text.y = dragY;
      }
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      this.dragCount++;
      gameObject.setScale(1.1); // 拖拽时放大
      gameObject.setDepth(100); // 置于顶层
      
      const text = gameObject.getData('text');
      if (text) {
        text.setDepth(101);
      }
      
      this.updateStatusText();
    });

    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setScale(1); // 恢复大小
      gameObject.setDepth(0);
      
      const text = gameObject.getData('text');
      if (text) {
        text.setDepth(1);
      }
      
      // 松手后执行排序
      this.sortObjectsByY();
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(200);
    this.updateStatusText();

    // 创建说明文本
    const instructions = this.add.text(10, 550, 
      '拖拽紫色方块，松手后自动按Y坐标排序', {
      fontSize: '16px',
      color: '#FFFF00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructions.setDepth(200);
  }

  sortObjectsByY() {
    this.sortCount++;
    this.updateStatusText();

    // 按当前Y坐标排序
    const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算排列位置（左侧垂直排列）
    const targetX = 100;
    const startY = 50;
    const verticalSpacing = 28;

    // 缓动动画移动到目标位置
    sortedObjects.forEach((obj, index) => {
      const targetY = startY + index * verticalSpacing;
      
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新文本位置
          const text = obj.getData('text');
          if (text) {
            text.x = obj.x;
            text.y = obj.y;
          }
        }
      });

      // 同时移动文本
      const text = obj.getData('text');
      if (text) {
        this.tweens.add({
          targets: text,
          x: targetX,
          y: targetY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });
  }

  updateStatusText() {
    this.statusText.setText(
      `拖拽次数: ${this.dragCount} | 排序次数: ${this.sortCount} | 物体数量: ${this.objects.length}`
    );
  }

  update(time, delta) {
    // 可选：添加悬停效果
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