class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.sortOrder = []; // 状态信号：记录当前排序顺序
    this.dragCount = 0; // 状态信号：拖拽次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建黄色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 100, 80);
    graphics.generateTexture('yellowBox', 100, 80);
    graphics.destroy();

    // 创建3个黄色物体，初始位置随机
    const initialPositions = [
      { x: 200, y: 150 },
      { x: 400, y: 350 },
      { x: 600, y: 250 }
    ];

    for (let i = 0; i < 3; i++) {
      const obj = this.add.sprite(
        initialPositions[i].x,
        initialPositions[i].y,
        'yellowBox'
      );
      
      obj.setInteractive({ draggable: true });
      obj.name = `Object${i + 1}`;
      obj.index = i;
      
      // 添加边框以区分物体
      const border = this.add.graphics();
      border.lineStyle(3, 0x000000, 1);
      border.strokeRect(
        obj.x - 50,
        obj.y - 40,
        100,
        80
      );
      obj.border = border;
      
      // 添加文本标签
      const text = this.add.text(obj.x, obj.y, `${i + 1}`, {
        fontSize: '32px',
        color: '#000000',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      obj.text = text;
      
      this.objects.push(obj);
    }

    // 初始化排序顺序
    this.updateSortOrder();

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 更新边框和文本位置
      gameObject.border.clear();
      gameObject.border.lineStyle(3, 0xff0000, 1); // 拖拽时变红
      gameObject.border.strokeRect(dragX - 50, dragY - 40, 100, 80);
      gameObject.text.setPosition(dragX, dragY);
    });

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setDepth(1); // 提升层级
      this.dragCount++;
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setDepth(0); // 恢复层级
      
      // 恢复边框颜色
      gameObject.border.clear();
      gameObject.border.lineStyle(3, 0x000000, 1);
      gameObject.border.strokeRect(
        gameObject.x - 50,
        gameObject.y - 40,
        100,
        80
      );
      
      // 按Y坐标排序
      this.sortObjectsByY();
    });

    // 添加说明文本
    this.add.text(400, 50, '拖拽黄色物体，松手后自动按Y坐标排列', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示状态信息
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#ffffff'
    });
    this.updateStatusText();
  }

  sortObjectsByY() {
    // 按Y坐标排序物体
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新位置（垂直排列，X坐标固定在中心）
    const centerX = 400;
    const startY = 150;
    const spacing = 150;
    
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      // 使用Tween动画平滑移动
      this.tweens.add({
        targets: obj,
        x: centerX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 更新边框和文本位置
          obj.border.clear();
          obj.border.lineStyle(3, 0x000000, 1);
          obj.border.strokeRect(obj.x - 50, obj.y - 40, 100, 80);
          obj.text.setPosition(obj.x, obj.y);
        },
        onComplete: () => {
          // 动画完成后更新排序顺序
          this.updateSortOrder();
        }
      });
    });
  }

  updateSortOrder() {
    // 更新当前排序顺序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    this.sortOrder = sorted.map(obj => obj.index + 1);
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText(
      `拖拽次数: ${this.dragCount}\n当前顺序: [${this.sortOrder.join(', ')}]`
    );
  }

  update(time, delta) {
    // 每帧更新（如需要）
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