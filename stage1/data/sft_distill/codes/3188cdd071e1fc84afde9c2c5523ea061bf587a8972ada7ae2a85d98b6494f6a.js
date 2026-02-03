class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：排序次数
    this.boxes = [];
    this.isSorting = false; // 防止排序时拖拽
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建青色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture('cyanBox', 80, 80);
    graphics.destroy();

    // 创建5个青色物体，初始位置随机分布
    const startX = 400;
    const startYPositions = [100, 200, 300, 400, 500];
    
    // 打乱初始Y坐标
    Phaser.Utils.Array.Shuffle(startYPositions);

    for (let i = 0; i < 5; i++) {
      const box = this.add.image(startX, startYPositions[i], 'cyanBox');
      box.setInteractive({ draggable: true });
      box.originalX = startX;
      box.id = i; // 用于调试
      
      // 添加编号文本
      const text = this.add.text(startX, startYPositions[i], `${i + 1}`, {
        fontSize: '32px',
        color: '#000000',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      box.labelText = text;
      
      this.boxes.push(box);
    }

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (!this.isSorting) {
        gameObject.x = dragX;
        gameObject.y = dragY;
        // 同步文本位置
        gameObject.labelText.x = dragX;
        gameObject.labelText.y = dragY;
      }
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      if (!this.isSorting) {
        this.sortBoxes();
      }
    });

    // 添加说明文字
    this.add.text(400, 30, '拖拽青色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortCountText = this.add.text(400, 570, `排序次数: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#00ffff'
    }).setOrigin(0.5);
  }

  sortBoxes() {
    this.isSorting = true;
    this.sortCount++;
    this.sortCountText.setText(`排序次数: ${this.sortCount}`);

    // 收集所有物体的Y坐标并排序
    const boxesWithY = this.boxes.map(box => ({
      box: box,
      y: box.y
    }));

    // 按Y坐标从小到大排序
    boxesWithY.sort((a, b) => a.y - b.y);

    // 计算目标Y坐标（等间距分布）
    const startY = 100;
    const spacing = 100;

    // 使用Tween动画移动到排序后的位置
    boxesWithY.forEach((item, index) => {
      const targetY = startY + index * spacing;
      const targetX = item.box.originalX;

      this.tweens.add({
        targets: item.box,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步文本位置
          item.box.labelText.x = item.box.x;
          item.box.labelText.y = item.box.y;
        },
        onComplete: () => {
          // 所有动画完成后解除锁定
          const allComplete = this.boxes.every(box => {
            return !this.tweens.isTweening(box);
          });
          
          if (allComplete) {
            this.isSorting = false;
          }
        }
      });
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（当前无需特殊处理）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: DragSortScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);