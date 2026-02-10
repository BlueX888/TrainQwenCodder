class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0; // 可验证的状态信号：拖拽次数
    this.sortedOrder = []; // 可验证的状态信号：当前排序顺序
    this.objects = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文字
    this.add.text(400, 30, '拖拽黄色方块进行排序', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建状态显示文字
    this.statusText = this.add.text(400, 70, '', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 使用Graphics创建黄色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillRect(0, 0, 80, 80);
    graphics.lineStyle(3, 0xff9900, 1); // 橙色边框
    graphics.strokeRect(0, 0, 80, 80);
    graphics.generateTexture('yellowBox', 80, 80);
    graphics.destroy();

    // 创建5个黄色物体，随机Y坐标
    const startX = 400;
    const startYPositions = [150, 250, 350, 450, 550];
    
    // 打乱初始Y坐标
    Phaser.Utils.Array.Shuffle(startYPositions);

    for (let i = 0; i < 5; i++) {
      const box = this.add.image(startX, startYPositions[i], 'yellowBox');
      box.setInteractive({ draggable: true });
      box.setData('index', i); // 存储原始索引
      box.setData('originalY', startYPositions[i]); // 存储初始Y坐标
      
      // 添加标签显示序号
      const label = this.add.text(0, 0, `${i + 1}`, {
        fontSize: '32px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      box.setData('label', label);
      label.setPosition(box.x, box.y);
      
      this.objects.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步标签位置
      const label = gameObject.getData('label');
      label.setPosition(dragX, dragY);
      
      // 拖拽时提升深度
      gameObject.setDepth(100);
      label.setDepth(101);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时放大
      this.tweens.add({
        targets: gameObject,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        ease: 'Power2'
      });
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复缩放
      this.tweens.add({
        targets: gameObject,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2'
      });
      
      // 恢复深度
      gameObject.setDepth(0);
      gameObject.getData('label').setDepth(1);
      
      // 增加拖拽计数
      this.dragCount++;
      
      // 执行排序
      this.sortObjects();
    });

    // 初始化排序顺序
    this.updateSortedOrder();
    this.updateStatusText();
  }

  sortObjects() {
    // 按Y坐标排序所有物体
    const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算排列位置
    const targetX = 400;
    const startY = 150;
    const spacing = 100;
    
    // 使用补间动画移动到新位置
    sortedObjects.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          // 同步标签位置
          const label = obj.getData('label');
          label.setPosition(obj.x, obj.y);
        }
      });
      
      // 同步标签动画
      const label = obj.getData('label');
      this.tweens.add({
        targets: label,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });
    
    // 更新排序顺序状态
    this.updateSortedOrder();
    this.updateStatusText();
  }

  updateSortedOrder() {
    // 记录当前从上到下的排序顺序（使用原始索引）
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    this.sortedOrder = sorted.map(obj => obj.getData('index') + 1);
  }

  updateStatusText() {
    this.statusText.setText(
      `拖拽次数: ${this.dragCount} | 当前顺序: [${this.sortedOrder.join(', ')}]`
    );
  }

  update(time, delta) {
    // 实时更新排序顺序（用于显示）
    if (this.input.activePointer.isDown) {
      const sorted = [...this.objects].sort((a, b) => a.y - b.y);
      const currentOrder = sorted.map(obj => obj.getData('index') + 1);
      
      // 只在顺序变化时更新
      if (JSON.stringify(currentOrder) !== JSON.stringify(this.sortedOrder)) {
        this.sortedOrder = currentOrder;
        this.updateStatusText();
      }
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